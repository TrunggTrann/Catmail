const mongoose = require("mongoose");
const fs = require("fs");
const bcrypt = require('bcryptjs');

const Account = require("./src/models/Account");
const Admin = require("./src/models/Admin");
const Config = require("./src/models/Config");
const BadKeyword = require("./src/models/BadKeyword");
const Mail = require("./src/models/Mail");
const MailForward = require("./src/models/MailForward");

mongoose.connect("mongodb://127.0.0.1/ck_nodejs", { useNewUrlParser: true, useUnifiedTopology: true });

const dbData = JSON.parse(fs.readFileSync("database.json"));

const accounts = dbData.accounts.map((accountData) => {
    const hashedPassword = bcrypt.hashSync(accountData.password, 10);
    const account = new Account({...accountData, password: hashedPassword});
    return account;
});
const admins = dbData.admin.map((admin) => {
  const hashedPassword = bcrypt.hashSync(admin.password, 10);
  const account = new Admin({...admin, password: hashedPassword});
  return account;
});
// const mails = dbData.mails.map((mailData) => new Mail(mailData));

async function initDB() {
  try {
      await Account.insertMany(accounts);
      await Admin.insertMany(admins);
      await Config.insertMany(dbData.configs);
      await BadKeyword.insertMany(dbData.badKeywords);
      await Mail.insertMany(dbData.mails);
      await MailForward.insertMany(dbData.mailforward);

      // await Mail.insertMany(mails);
      console.log("Data inserted successfully.");
  } catch (err) {
      console.error(err);
  }
  mongoose.connection.close();
}

initDB();
