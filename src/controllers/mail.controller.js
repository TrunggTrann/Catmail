const Mail = require('../models/Mail');
const MailForward = require('../models/MailForward');
const Account = require('../models/Account');

const moment = require("moment")
const jwt = require('jsonwebtoken')

/**
 * The function takes in email addresses of recipients and BCC recipients, searches for their
 * corresponding user IDs in a MongoDB database, and returns the IDs.
 */
async function getAccountId(receiver, bcc, res) {
    const toArr = receiver.split(',').map(email => email.trim()); // tách các địa chỉ email và loại bỏ khoảng trắng
    let bccArr = []
    let receiverArr = []

    if(bcc == '') receiverArr = toArr
    else {
        bccArr = bcc.split(',').map(email => email.trim())
        receiverArr = toArr.concat(bccArr)
    }
    
    // Tìm kiếm người dùng trong MongoDB bằng email
    const users = await Account.find({ email: { $in: receiverArr } }).exec();
  
    const userMap = {};
    users.forEach(function (user) {
        userMap[user.email] = user._id;
    });
    // Lấy được các id của người gửi và xứ lý lỗi trả về nếu người gửi đó không tồn tại
    const receiversId = toArr.map((email) => {
        const userId = userMap[email];
        return { _id: userId };
    });
    
    let bccId = []
    if (bccArr.length > 0) {
        bccId = bccArr.map((email) => {
            const userId = userMap[email];
            return { _id: userId };
        });
    }
    return { receiversId, bccId }
}
class MailContainer {
    // Compose
    async compose(req, res) {
        /* This code block is responsible for composing and saving a new email message with optional
        attachments. It first decodes the user ID from the JWT token stored in the session, then
        extracts the necessary data from the request body (receiver, bcc, subject, and message). It
        then calls the `getAccountId` function to get the IDs of the email recipients and BCC
        recipients. It also processes any attachments included in the request. Finally, it creates a
        new `Mail` object with the extracted data and saves it to the database. */
        try {
            const decodeUser = jwt.decode(req.session.passport.user)

			const { receiver, bcc, subject, message } = req.body;
            
            const { receiversId, bccId } =  await getAccountId(receiver, bcc, res)
            //Xử lý attachment nếu có
            const attachmentData = req.files 
            const attachments = attachmentData.map(value => {
                return {
                    id: value.filename.split('.')[0],
                    originalName: value.originalname,
                    fileName: value.filename,
                    contentType: value.mimetype,
                    size: value.size
                }
            })
            //Create mail 
            const newMail = new Mail({
                sender: { _id: decodeUser._id },
                receiver: receiversId,
                bcc: bccId,
                message,
                subject,
                attachments,
            });
            await newMail.save();
		} catch (err) {
            console.log(err)
		}
    }
    //Forward: tuong tu nhu Compose, nhung co them parent email id
    async forward(req, res) {
        /* This code block is responsible for forwarding an email message. It first decodes the user ID
        from the JWT token stored in the session, then extracts the necessary data from the request
        body (receiver, bcc, message, and parent_mail). It then calls the `getAccountId` function to
        get the IDs of the email recipients and BCC recipients. It also processes any attachments
        included in the request. */
        try {
            const decodeUser = jwt.decode(req.session.passport.user)

			const { receiver, bcc, message, parent_mail } = req.body;

            const{ receiversId, bccId } = await getAccountId(receiver, bcc)
            //Xử lý attachment nếu có
            const attachmentData = req.files 
            const attachments = attachmentData.map(value => {
                return {
                    id: value.filename.split('.')[0],
                    originalName: value.originalname,
                    fileName: value.filename,
                    contentType: value.mimetype,
                    size: value.size
                }
            })
            //Subject từ parent mail
            const parent = await Mail.findById(parent_mail)
            let subject = ''
            if(parent) subject = parent.subject
            
            //Create mail 
			const newMailForward = new MailForward({
                parent_mail,
                sender: { _id: decodeUser._id },
                receiver: receiversId,
                bcc: bccId,
                message,
                subject: `Fwd: ${subject}`,
                attachments,
            });
				
			await newMailForward.save();
			console.log("Create forward success")
			
		} catch (err) {
			console.error(err);
		}
    }
	//Lấy danh sách tất cả mail
    async getAllMails(req, res) {
        /* This code block is responsible for getting all emails for the currently logged in user. It
        first decodes the user ID from the JWT token stored in the session. It then uses the `Mail`
        model to find all emails where the user is either the receiver or BCC recipient. It
        populates the `sender` field with the corresponding `Account` object and sorts the emails by
        date in descending order. It then maps the resulting array of emails to a new array of
        projected emails, which includes only the necessary fields for display purposes. Finally, it
        returns the projected emails as a JSON response with a status code of 200. */
        try {
            const decodeUser = jwt.decode(req.session.passport.user)
            
            const mails = await Mail.find({
                                    $or: [
                                            { receiver: { $elemMatch: { _id: decodeUser._id, isDeleted: false } } },
                                            { bcc: { $elemMatch: { _id: decodeUser._id, isDeleted: false } } }
                                    ]}).populate('sender._id').sort({ date: -1 }).exec()
            const mailForwards = await MailForward.find({
                                    $or: [
                                            { receiver: { $elemMatch: { _id: decodeUser._id, isDeleted: false } } },
                                            { bcc: { $elemMatch: { _id: decodeUser._id, isDeleted: false } } }
                                    ]}).populate('sender._id').sort({ date: -1 }).exec()
            const allMails = [...mails, ...mailForwards]; // nối mảng mails và mảng mailForwards lại với nhau
            allMails.sort((a, b) => b.date - a.date); // sắp xếp lại mảng allMails theo trường date

            const projectedMails = allMails.map((msg) => {             
				return {
					message: msg.message,
					date: moment(msg.date).format("h:mm DD-MM-YYYY"),
					sender: {
                        email: msg.sender.email,
                        name: `${msg.sender.firstname} ${msg.sender.lastname}`,
                        avatar: msg.sender.avatar,
                    },
					subject: msg.subject,
                    isRead: msg.receiver.map((val) => {if (val._id.toString() == decodeUser._id) return val.isRead }) || msg.bcc.map((val) => {if (val._id.toString() == decodeUser._id) return val.isRead }),
                    isImportant: msg.receiver.map((val) => {if (val._id.toString() == decodeUser._id) return val.isImportant }) || msg.bcc.map((val) => {if (val._id.toString() == decodeUser._id) return val.isImportant }),
					_id: msg._id.toString()
				};
			});
            return res.status(200).json(projectedMails);
        } catch (err) {
            console.error(err);
        }
    };

    // Hiển thị chi tiết mail
    async getMail(req, res) {
        try {
            /* Retrieves a specific email or email forward by its ID and returns a projected version of it with certain fields populated. The
            function first checks if the user's ID is included in the "bcc" field of the email, and if so, will not let the user know other 
            users sent with them. If the user's ID is not in the "bcc" field, the function checks if the user's ID is included in the
            "receiver" field of the email. If so, users in this field will be able to see the same email recipients */
            const { id } = req.params
            const decodeUser = jwt.decode(req.session.passport.user)

            const mail = await Mail.findById(id).populate('sender._id').populate('receiver._id').populate('bcc._id');
            if(mail) {
                const bccIds = mail.bcc.map(bcc => bcc._id._id.toString());
                if (bccIds.includes(decodeUser._id)) {
                    // _id của user này thuộc trường 'bcc'
                    const projectedMail = {             
                        message: mail.message,
                        date: moment(mail.date).format("h:mm DD-MM-YYYY"),
                        sender: {
                            email: mail.sender._id.email,
                            name: `${mail.sender._id.firstname} ${mail.sender._id.lastname}`,
                            avatar: mail.sender._id.avatar,
                        },
                        subject: mail.subject,
                        // isRead: mail.isRead,
                        // isDeleted: mail.isDeleted,
                        // isImportant: mail.isImportant,
                        attachments: mail.attachments,
                        _id: mail._id.toString()
                    };
                    return res.status(200).json(projectedMail)
                } 
                // _id của user này thuộc trường 'receiver' 
                const receiverIds = mail.receiver.map(receiver => receiver._id);
                const receiverAccounts = await Account.find({
                    _id: { $in: receiverIds }
                });
                const bccId = mail.bcc.map(bcc => bcc._id);
                const bccAccounts = await Account.find({
                    _id: { $in: bccId }
                });

                const userMails = receiverAccounts.concat(bccAccounts)
                const projectedMail = {             
                    message: mail.message,
                    date: moment(mail.date).format("h:mm DD-MM-YYYY"),
                    sender: {
                        email: mail.sender._id.email,
                        name: `${mail.sender._id.firstname} ${mail.sender._id.lastname}`,
                        avatar: mail.sender._id.avatar,
                    },
                    userMails,
                    subject: mail.subject,
                    attachments: mail.attachments,
                    _id: mail._id.toString()
                };
                return res.status(200).json(projectedMail)
            } else {
                const mailForward = await MailForward.findById(req.params.id).populate('sender._id').populate('receiver._id').populate('bcc._id').populate('parent_mail');
                const bccIds = mailForward.bcc.map(bcc => bcc._id._id.toString());
                if (bccIds.includes(decodeUser._id)) {
                    // _id của user này thuộc trường 'bcc'
                    const projectedMailForward = {             
                        message: mailForward.message,
                        date: moment(mailForward.date).format("h:mm DD-MM-YYYY"),
                        sender: {
                            email: mailForward.sender._id.email,
                            name: `${mailForward.sender._id.firstname} ${mailForward.sender._id.lastname}`,
                            avatar: mailForward.sender._id.avatar,
                        },
                        subject: mailForward.subject,
                        attachments: mailForward.attachments,
                        _id: mailForward._id.toString()
                    };
                    return res.status(200).json(projectedMailForward)
                } 
                const receiverIds = mailForward.receiver.map(receiver => receiver._id);
                const receiverAccounts = await Account.find({
                    _id: { $in: receiverIds }
                });
                const bccId = mailForward.bcc.map(bcc => bcc._id);
                const bccAccounts = await Account.find({
                    _id: { $in: bccId }
                });
                const userMails = receiverAccounts.concat(bccAccounts)

                const projectedMailForward = {             
                    message: mailForward.message,
                    date: moment(mailForward.date).format("h:mm DD-MM-YYYY"),
                    sender: {
                        email: mailForward.sender._id.email,
                        name: `${mailForward.sender._id.firstname} ${mailForward.sender._id.lastname}`,
                        avatar: mailForward.sender._id.avatar,
                    },
                    userMails,
                    subject: mailForward.subject,
                    attachments: mailForward.attachments,
                    _id: mailForward._id.toString(),
                    forwardFrom: {
                        message: mailForward.parent_mail.message,
                        date: moment(mailForward.parent_mail.date).format("h:mm DD-MM-YYYY"),
                        attachments: mailForward.parent_mail.attachments,
                    }
                };
                return res.status(200).json(projectedMailForward)
            }
        } catch (err) {
            console.error(err);
        }
    };
    async unsendMail(req, res) {
        try {
            await Mail.findByIdAndDelete(req.params.id)
            res.status(200).json("recall success")
        } catch(err) {
            console.error(err);
        }
    }
    // Xóa mail
    async deleteMail(req, res) {
        try {
            const { id } = req.params;
            const decodeUser = jwt.decode(req.session.passport.user)
            const userId = decodeUser._id
            await Mail.deleteOne({_id: id, 
                                    $or: [
                                        { 'receiver._id': userId },
                                        { 'bcc._id': userId }
                                    ]
                                }, 
                                { $set: { 'receiver.$.isDeleted': true, 'bcc.$.isDeleted': true } });
            await MailForward.deleteOne({_id: id, 
                                            $or: [
                                                { 'receiver._id': userId },
                                                { 'bcc._id': userId }
                                            ]
                                        }, 
                                        { $set: { 'receiver.$.isDeleted': true, 'bcc.$.isDeleted': true } });
            res.status(200).json("delete success")
        } catch (err) {
            console.error(err);
        }
    };

    async deleteTempMail(req, res) {
		try{
			const { id, message } = req.params;
            const decodeUser = jwt.decode(req.session.passport.user)
            const userId = decodeUser._id

            const mail = await Mail.findOne({
                _id: id,
                $or: [
                  { 'sender._id': userId },
                  { 'receiver._id': userId },
                  { 'bcc._id': userId }
                ]
            }).exec();
            if (mail) {
                if (mail.sender._id == userId) {
                    mail.sender.isDeleted = message;
                }
              
                const receiverIndex = mail.receiver.findIndex(r => r._id.toString() == userId);
                if (receiverIndex !== -1) {
                    mail.receiver[receiverIndex].isDeleted = message;
                }
              
                const bccIndex = mail.bcc.findIndex(b => b._id.toString() === userId);
                if (bccIndex !== -1) {
                    mail.bcc[bccIndex].isDeleted = message;
                }
              
                await mail.save();
              
                res.status(200).json("update success");
            }
			const mailForward = await MailForward.findOne({
                _id: id,
                $or: [
                    { 'sender._id': userId },
                    { 'receiver._id': userId },
                    { 'bcc._id': userId }
                ]
            }).exec();
            if (mailForward) {
                if (mailForward.sender._id == userId) {
                    mailForward.sender.isDeleted = message;
                }
              
                const receiverIndex = mailForward.receiver.findIndex(r => String(r._id) === userId);
                if (receiverIndex !== -1) {
                    mailForward.receiver[receiverIndex].isDeleted = message;
                }
              
                const bccIndex = mailForward.bcc.findIndex(b => String(b._id) === userId);
                if (bccIndex !== -1) {
                    mailForward.bcc[bccIndex].isDeleted = message;
                }
              
                await mailForward.save();
              
                res.status(200).json("update success");
            }
		} catch (err) {
            console.log(err);
            res.status(500).json({ success: false, message: "Server error" });
		}
	};

    async readMail(req, res) {
		try{
			const { id } = req.params;
            const decodeUser = jwt.decode(req.session.passport.user)
            const userId = decodeUser._id
			const mail = await Mail.findOne({
                _id: id,
                $or: [
                  { 'receiver._id': userId },
                  { 'bcc._id': userId }
                ]
            }).exec();
            if (mail) {      
                const receiverIndex = mail.receiver.findIndex(r => r._id.toString() == userId);
                if (receiverIndex !== -1) {
                    mail.receiver[receiverIndex].isRead = true;
                }
              
                const bccIndex = mail.bcc.findIndex(b => b._id.toString() === userId);
                if (bccIndex !== -1) {
                    mail.bcc[bccIndex].isRead = true;
                }
                await mail.save();
              
                res.status(200).json("update success");
            }
			const mailForward = await MailForward.findOne({
                _id: id,
                $or: [
                    { 'receiver._id': userId },
                    { 'bcc._id': userId }
                ]
            }).exec();
            if (mailForward) {
                const receiverIndex = mailForward.receiver.findIndex(r => String(r._id) === userId);
                if (receiverIndex !== -1) {
                    mailForward.receiver[receiverIndex].isRead = true;
                }
              
                const bccIndex = mailForward.bcc.findIndex(b => String(b._id) === userId);
                if (bccIndex !== -1) {
                    mailForward.bcc[bccIndex].isRead = true;
                }
              
                await mailForward.save();
              
                res.status(200).json("update success");
            }
		} catch (err) {
            console.log(err);
            res.status(500).json({ success: false, message: "Server error" });
		}
	};

    async checkImportantMail(req, res) {
        try{
			const { id, message } = req.params;
            const decodeUser = jwt.decode(req.session.passport.user)
            const userId = decodeUser._id
			const mail = await Mail.findOne({
                _id: id,
                $or: [
                  { 'sender._id': userId },
                  { 'receiver._id': userId },
                  { 'bcc._id': userId }
                ]
            }).exec();
            if (mail) {
                if (mail.sender._id == userId) {
                    mail.sender.isImportant = message;
                }
              
                const receiverIndex = mail.receiver.findIndex(r => r._id.toString() == userId);
                if (receiverIndex !== -1) {
                    mail.receiver[receiverIndex].isImportant = message;
                }
              
                const bccIndex = mail.bcc.findIndex(b => b._id.toString() === userId);
                if (bccIndex !== -1) {
                    mail.bcc[bccIndex].isImportant = message;
                }
              
                await mail.save();
              
                res.status(200).json("update success");
            }
			const mailForward = await MailForward.findOne({
                _id: id,
                $or: [
                    { 'sender._id': userId },
                    { 'receiver._id': userId },
                    { 'bcc._id': userId }
                ]
            }).exec();
            if (mailForward) {
                if (mailForward.sender._id == userId) {
                    mailForward.sender.isImportant = message;
                }
              
                const receiverIndex = mailForward.receiver.findIndex(r => String(r._id) === userId);
                if (receiverIndex !== -1) {
                    mailForward.receiver[receiverIndex].isImportant = message;
                }
              
                const bccIndex = mailForward.bcc.findIndex(b => String(b._id) === userId);
                if (bccIndex !== -1) {
                    mailForward.bcc[bccIndex].isImportant = message;
                }
              
                await mailForward.save();
              
                res.status(200).json("update success");
            }
		} catch (err) {
            console.log(err);
            res.status(500).json({ success: false, message: "Server error" });
		}
    }
}

module.exports = new MailContainer()
