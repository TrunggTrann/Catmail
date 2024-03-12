
const BadKeyword = require("../models/BadKeyword")
const Account = require("../models/Account")
const Config = require("../models/Config")
const jwt = require("jsonwebtoken")
const { SECRET_KEY_JWT } = process.env

class AdminContainer {
    show(req, res) {
        res.render("admin/home", { layout : 'admin'})
    }
    showUsers(req, res) {
        res.render("admin/users", { layout : 'admin'})
    }
    showConfigs(req, res) {
        res.render("admin/configs", { layout : 'admin'})
    }
    showBadKeywords(req, res) {
        res.render("admin/badKeywords", { layout : 'admin'})
    }
    
	async getAllUsers(req, res) {
        try {
            const users = await Account.find();
            res.json(users);
          } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async lockUser(req, res) {
        try {
            const user = await Account.findById(req.params.id);
            if (!user) {
              return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }
            user.isLocked = true;
            await user.save();
            res.status(200).json({ message: 'Tài khoản của người dùng đã bị khóa' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Đã có lỗi xảy ra' });
        }
    }
    async unlockUser(req, res) {
        try {
            const user = await Account.findById(req.params.id);
            if (!user) {
              return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }
            user.isLocked = false;
            await user.save();
            res.status(200).json({ message: 'Tài khoản của người dùng đã bị khóa' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Đã có lỗi xảy ra' });
        }
    }
    async deleteUser(req, res) {
        try {
            const result = await Account.findByIdAndDelete(req.params.id);
            if (result) {
              res.json({ message: 'User deleted' });
            } else {
              res.status(404).json({ message: 'User not found'})
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Internal server error' });
        }

    }
    async getConfig(req, res) {
        try {
            const configs = await Config.findOne({});
            res.json(configs)
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    }
    async createConfig(req, res) {
        const { maxRecipients, maxAttachmentSize, maxAttachments, maxEmailSize } = req.body;
        try {
            const configs = await Config.findOneAndUpdate({}, {
                maxRecipients,
                maxAttachmentSize: maxAttachmentSize * 1024 * 1024,
                maxAttachments,
                maxEmailSize: maxEmailSize * 1024 * 1024,
            }, {
                upsert: true,
                new: true,
            });
            res.status(201).json(configs);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }
    async getBadKeyword(req, res) {
        try {
            const badKeywords = await BadKeyword.find();
            res.json(badKeywords);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async createBadKeyword(req, res) {
        const badKeyword = new BadKeyword({
            keyword: req.body.keyword
        });
        
        try {
            const newBadKeyword = await badKeyword.save();
            res.status(201).json(newBadKeyword);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
    async deleteBadKeyword(req, res) {
        try {
            const deletedBadKeyword = await BadKeyword.findByIdAndDelete(req.params.id);
            if (deletedBadKeyword) {
                res.json(deletedBadKeyword);
            } else {
                res.status(404).json({ message: 'Bad keyword not found' });
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}


module.exports = new AdminContainer()

