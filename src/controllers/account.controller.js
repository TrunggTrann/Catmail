const isValidPayload= require('../utils/isValidPayload')
const { apiFailure, apiSuccess } = require('../utils/api-response')
const Mail = require('../models/Mail')
const Account = require("../models/Account")
const Draft = require("../models/Draft");
const Label = require("../models/Label")
const MarkLabel = require('../models/MarkLabel')

const moment = require("moment")
const fs = require("fs")
const jwt = require("jsonwebtoken")
class AccountContainer {

	async show(req, res) {
		res.render('home')
	}

	async getUser(req, res) {
		const userId = req.params.id;
		Account.findById(userId, (err, user) => {
			if (err) {
			  return res.status(500).send({ message: err.message });
			}
		  
			if (!user) {
			  return res.status(404).send({ message: 'User not found' });
			}
			const { firstname, lastname, avatar, location, role, phone, email } = user
			return res.json({ firstname, lastname, avatar, location, role, phone, email });
		});
	}
	async updateUser(req, res) {
		try {
			const userId = req.params.id;
			const updates = req.body;
			const options = { new: true };
			const updatedUser = await Account.findByIdAndUpdate(userId, updates, options);
			res.redirect('/details')
		} catch (error) {
			console.error(error);
			res.status(500).send(error);
		}
	}
	async updateAvatar(req, res) {
		// Đọc file đã upload bằng multer
		const file = req.file;
		const filePath = file.path;
		 // Lưu file vào thư mục trên server		
		
		const updateAvatar = await Account.findByIdAndUpdate(req.params.id, { avatar: `/avatar/${file.filename}`}, {new : true})
		res.status(200).send(updateAvatar);
	}
	async getDraft(req, res) {
		try {
			const { id, userId } = req.params
			
			const drafts = await Draft.find({ user_id: userId, _id: id }).select([
				"receiver",
				"message",
				"subject",
				"attachment",
			]);
			return res.json(drafts)
		} catch (ex) {
			console.log(ex)
		}
	}
	async updateDraft(req, res) {
		try {
			const { id, userId } = req.params
			const updateFields = {
				receiver: req.body.receiver,
				message: req.body.message,
				subject: req.body.subject,
				attachment: req.body.attachment,
			}
			const updateDraft = await Draft.updateMany({ user_id: userId, _id: id }, updateFields)
			res.json(updateDraft)
		} catch(err) {
			console.log(err)
		}
	}
	async deleteDraft(req, res) {
		try {
			const { id, userId } = req.params
			await Draft.deleteMany({ user_id: userId, _id: id })
			res.json('Deleted succes')
		} catch(err) {
			console.log(err)
		}
	}
	async getAllDrafts(req, res) {
		try {
			const drafts = await Draft.find({ user_id: req.params.userId }).select([
				"receiver",
				"message",
				"subject",
				"attachment",
			]);
			const projectedDrafts = drafts.map((msg) => {    
				return {
					message: msg.message,
					date: moment(msg.updatedAt).format("h:mm DD-MM-YYYY"),
					receiver: msg.receiver,
					subject: msg.subject == "" ? 'No subject': msg.subject,
					_id: msg._id.toString()
				};
			});
			return res.json(projectedDrafts)
		} catch (ex) {
			console.log(ex)
		}
	}
	async createDrafts(req, res) {
		const decodeUser = jwt.decode(req.session.passport.user)
		const draft = new Draft({
			userMail:  decodeUser._id,
			receiver: req.body.receiver,
			bcc: req.body.bcc,
			subject: req.body.subject,
			message: req.body.message
		})
		try {
            const newDraft = await draft.save();
            res.status(201).json(newDraft);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
		
	}
	async deleteLabel(req, res) {
		try {
			const { id, userId } = req.params
			
			await Label.deleteMany({ user_id: userId, _id: id })
			res.json('Deleted succes')
		} catch(err) {
			console.log(err)
		}
	}
	async createLabelMail(req, res) {
		try {
			const marklabel = new MarkLabel({
				labelId: req.body.labelId,
				mailId: req.params.mailId,
			});
            const newMarkLabel = await marklabel.save();
            res.status(201).json(newMarkLabel);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }

	}
	async getAllLabels(req, res) {
		try {
			const label = await Label.find({user_id: req.params.userId}).select([
				"name",
				"hide",
			]);
			return res.json(label)
		} catch (ex) {
			console.log(ex)
		}
	}
	async createLabels(req, res) {
		try {
			const label = new Label({
				name: req.body.name,
				hide: req.body.hide == 'on' ? true : false,
				user_id: req.body.userId,
			});
            const newLabel = await label.save();
            res.status(201).json(newLabel);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
	}
	logOut(req, res) {
		delete req.session.passport.user;
		delete req.session.role;

		return res.redirect('/login');
	}

	async mailFilter(req, res) {
		try {
			const mails = await Mail.find({sender: {$eq: req.session.userMail}}).sort({ date: -1 }).exec();
			return res.render('home', { userMail: req.session.userMail, mails: mails})
		} catch (err) {
			console.error(err);
		}
	}

	// async showDetailMail(req, res) {
	// 	const id = req.params.id;
		
	// 	const mail = await Mail.findOne({_id: id});
	// 	await Mail.updateOne({ _id: id }, { $set: { isRead: true } })
	// 	const nameSender = await Account.find({email: mail.sender}).select(["firstname", "lastname"]);
	// 	const name = nameSender[0].firstname + " " + nameSender[0].lastname;
    //     res.send({ mail: mail, name: name })
	// }


	async importantMail(req, res) {
		const id = req.params.id;
		
		await Mail.updateOne({ _id: id }, { $set: { isImportant: true } })
		
		
        res.send({ mail: mail, name: name })
	}

}

module.exports = new AccountContainer()

