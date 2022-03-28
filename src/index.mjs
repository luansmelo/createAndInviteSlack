import { WebClient } from '@slack/web-api'
import csv from "csv-parser"
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config({
  path: 'C:/Users/luans/Desktop/antichijo/.env'
});

function loadCsvData(filename) {
  return new Promise(function (resolve) {
    const results = [];
    fs.createReadStream(filename)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results));
  })
}

(async () => {

  const token = process.env.SLACK_TOKEN
  const web = new WebClient(token);

  const className = process.argv[2].toLowerCase().trim()
  /** @type {{ email: string; }[]} */
  const studentsEmail = await loadCsvData('data.csv');

  const nameChannelsInviteStudents = ["anuncios", "dúvidas", "geral"]

  for (let channelName of nameChannelsInviteStudents) {
    const createChannelsName = await web.conversations.create({
      name: `${className}_${channelName}`,
      team_id: process.env.SLACK_TEAM_ID,
      is_private: true,
      token,
    })

    for (let emailInvite of studentsEmail) {
      try {
        const findStudentsByEmail = await web.users.lookupByEmail({
          email: emailInvite.email,
          token
        })

        await web.conversations.invite({
          channel: createChannelsName.channel.id,
          users: findStudentsByEmail.user.id,
          token,
        })
      } catch (err) {
        continue
      }
    }
  }
  console.log("program completed successfully.")
})().catch(console.error)
