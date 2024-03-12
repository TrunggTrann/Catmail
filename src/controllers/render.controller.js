const Account = require("../models/Account")
const Mail = require("../models/Mail")
const MailForward = require("../models/MailForward")
const MarkLabel = require("../models/MarkLabel")
const paginate = require('paginate');

const moment = require("moment")
const jwt = require('jsonwebtoken')

class RenderContainer {

    
    
    async show(req, res) {
        /* This code is rendering the home page for a user.Finds the user's account in the database using their
        email. It then finds all the mails and mail forwards that the user is either the receiver or
        BCC recipient of, and combines them into one array. The array is sorted by date, and then
        each mail object is mapped to a new object with only the necessary fields for display on the
        home page. Finally, the home page is rendered with the user's information and the array of
        projected mails. */
        const decodeUser = jwt.decode(req.session.passport.user)
        let user = await Account.findOne({ email: decodeUser.email })
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
            var user = msg.sender
            if (msg.receiver.find(val => val._id.equals(decodeUser._id))) user = msg.receiver.find(val => val._id.equals(decodeUser._id))
            else user = msg.bcc.find(val => val._id.equals(decodeUser._id))

            return {
                message: msg.message,
                date: moment(msg.date).format("h:mm DD-MM-YYYY"),
                sender: {
                    email: msg.sender._id.email,
                    name: `${msg.sender._id.firstname} ${msg.sender._id.lastname}`,
                    avatar: msg.sender._id.avatar.toString(),
                },
                subject: msg.subject,
                isRead: user.isRead,
                isImportant: user.isImportant,
                _id: msg._id.toString()
            };
        });
        res.render('home', { layout: 'user', user, mails: projectedMails, sender: projectedMails.sender, title: 'Inbox', route: '/'});
    }

    async showDrafts(req, res) {
        const decodeUser = jwt.decode(req.session.passport.user)
        let user = await Account.findOne({ email: decodeUser.email })
        res.render('drafts', { layout: 'user', user, route: '/drafts' })
    }

	async showDetails(req, res) {
        const decodeUser = jwt.decode(req.session.passport.user)
        let user = await Account.findOne({ email: decodeUser.email })
        res.render('detailUser', { layout: 'user', user })
    }

    async showSentMail(req, res) {
        const decodeUser = jwt.decode(req.session.passport.user)
        let user = await Account.findOne({ email: decodeUser.email })
        
        const mails = await Mail.find({ 'sender._id': decodeUser._id, 'sender.isDeleted': false }).populate('sender._id').sort({ date: -1 }).exec()
        const mailForwards = await MailForward.find({ 'sender._id': decodeUser._id, 'sender.isDeleted': false }).populate('sender._id').sort({ date: -1 }).exec()
        const allMails = [...mails, ...mailForwards]; // nối mảng mails và mảng mailForwards lại với nhau
        allMails.sort((a, b) => b.date - a.date); // sắp xếp lại mảng allMails theo trường date
        const projectedMails = allMails.map((msg) => {             
            return {
                message: msg.message,
                date: moment(msg.date).format("h:mm DD-MM-YYYY"),
                sender: {
                    email: msg.sender._id.email,
                    name: `${msg.sender._id.firstname} ${msg.sender._id.lastname}`,
                    avatar: msg.sender._id.avatar.toString(),
                },
                subject: msg.subject,
                isImportant: msg.sender.isImportant,
                isDeleted: msg.sender.isDeleted,
                _id: msg._id.toString()
            };
        });

        res.render('sendMail', { layout: 'user', user, mails: projectedMails, sender: projectedMails.sender,  route: '/sent-mail' })
    }

    async showDeleteMail(req, res) {
        const decodeUser = jwt.decode(req.session.passport.user)
        let user = await Account.findOne({ _id: decodeUser._id })
        const mails = await Mail.find({
                                $or: [
                                        { 'sender._id': decodeUser._id, 'sender.isDeleted': true },
                                        { receiver: { $elemMatch: { _id: decodeUser._id, isDeleted: true } } },
                                        { bcc: { $elemMatch: { _id: decodeUser._id, isDeleted: true } } }
                                ]}).populate('sender._id').sort({ date: -1 }).exec()
        const mailForwards = await MailForward.find({ 
                                $or: [
                                        { 'sender._id': decodeUser._id, 'sender.isDeleted': true },
                                        { receiver: { $elemMatch: { _id: decodeUser._id, isDeleted: true } } },
                                        { bcc: { $elemMatch: { _id: decodeUser._id, isDeleted: true } } }
                                ]}).populate('sender._id').sort({ date: -1 }).exec()
        const allMails = [...mails, ...mailForwards]; // nối mảng mails và mảng mailForwards lại với nhau
        allMails.sort((a, b) => b.date - a.date); // sắp xếp lại mảng allMails theo trường date

        const projectedMails = allMails.map((msg) => {             
            return {
                message: msg.message,
                date: moment(msg.date).format("h:mm DD-MM-YYYY"),
                sender: {
                    email: msg.sender._id.email,
                    name: `${msg.sender._id.firstname} ${msg.sender._id.lastname}`,
                    avatar: msg.sender._id.avatar.toString(),
                },
                subject: msg.subject,
                _id: msg._id.toString()
            };
        });
        
        res.render('deleteMail', { layout: 'user', user, mails: projectedMails, sender: projectedMails.sender, route: '/delete' })
    }
    async showLabels(req, res) {
        const decodeUser = jwt.decode(req.session.passport.user)
        let user = await Account.findOne({ email: decodeUser.email })
        let mails = await MarkLabel.find({ labelId: req.params.id }).populate('mailId').populate('labelId').exec();
        if (mails.length > 0) {
            const projectedMails = [];
            for (const value of mails) {
                let sender = await Account.findOne({ _id: value.mailId.sender._id }).exec();
                projectedMails.push({
                    label: value.labelId.name,
                    sender: {
                        name: `${sender.firstname} ${sender.lastname}`,
                        avatar: sender.avatar,
                    },
                    message: value.mailId.message,
                    subject: value.mailId.subject,
                    _id: value.mailId._id,
                });
            }
            res.render('home', { layout: 'user', user, mails : projectedMails, title: `Labels`,route: `/labels/${req.params.id}` })
        } else {
            res.render('home', { layout: 'user', user, mails : [], title: `Labels`,route: `/labels/${req.params.id}` })
        }
    }

    async showImportantMail(req, res){
        const decodeUser = jwt.decode(req.session.passport.user)
        let user = await Account.findOne({ email: decodeUser.email })
        const mails = await Mail.find({
                        $or: [
                                { 'sender._id': decodeUser._id, 'sender.isImportant': true, 'sender.isDeleted': false },
                                { receiver: { $elemMatch: { _id: decodeUser._id, isImportant: true, isDeleted: false } } },
                                { bcc: { $elemMatch: { _id: decodeUser._id, isImportant: true, isDeleted: false } } }
                        ]}).populate('sender._id').sort({ date: -1 }).exec()
        const mailForwards = await MailForward.find({
                        $or: [
                                { 'sender._id': decodeUser._id, 'sender.isImportant': true, 'sender.isDeleted': false },
                                { receiver: { $elemMatch: { _id: decodeUser._id, isImportant: true, isDeleted: false } } },
                                { bcc: { $elemMatch: { _id: decodeUser._id, isImportant: true, isDeleted: false } } }
                        ]}).populate('sender._id').sort({ date: -1 }).exec()
        
        const allMails = [...mails, ...mailForwards]; // nối mảng mails và mảng mailForwards lại với nhau
        allMails.sort((a, b) => b.date - a.date); // sắp xếp lại mảng allMails theo trường date
        const projectedMails = allMails.map((msg) => {   
            var user = msg.sender
            if (msg.receiver.find(val => val._id.equals(decodeUser._id))) user = msg.receiver.find(val => val._id.equals(decodeUser._id))
            else user = msg.bcc.find(val => val._id.equals(decodeUser._id))       
            return {
                message: msg.message,
                date: moment(msg.date).format("h:mm DD-MM-YYYY"),
                sender: {
                    email: msg.sender._id.email,
                    name: `${msg.sender._id.firstname} ${msg.sender._id.lastname}`,
                    avatar: msg.sender._id.avatar,
                },
                subject: msg.subject,
                isRead: user.isRead,
                isImportant: user.isImportant,
                _id: msg._id.toString()
            };
        });

        res.render('important', { layout: 'user', user, mails: projectedMails, sender: projectedMails.sender,title: 'Important Mail', route: '/important'});
    }


}

module.exports = new RenderContainer()

