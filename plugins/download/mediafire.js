const { decode } = require('html-entities');

exports.run = {
    usage: ['mediafire'],
    hidden: ['mf'],
    use: 'link',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, users, env, Func }) => {
        try {
            // Check if the argument is provided
            if (!args || !args[0]) {
                return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.mediafire.com/file/1fqjqg7e8e2v3ao/YOWA.v8.87_By.SamMods.apk/file'), m);
            }

            // Validate the mediafire link
            if (!args[0].match(/(https:\/\/www.mediafire.com\/)/gi)) {
                return client.reply(m.chat, global.status.invalid, m);
            }

            // Send a reaction to indicate processing
            client.sendReact(m.chat, '🕒', m.key);

            // Fetch mediafire data
            var json = await Api.neoxr('/mediafire', { url: args[0] });

            // Check if the request was successful
            if (!json.status) {
                return client.reply(m.chat, Func.jsonFormat(json), m);
            }

            // Extract file details
            const fileName = unescape(decode(json.data.filename));
            const fileSize = json.data.size;
            const fileBytes = json.data.bytes;
            const fileExtension = json.data.extension;
            const fileMime = json.data.mime;
            const fileLink = json.data.url;
            const fileUploaded = json.data.uploaded || 'Unknown';
            const fileDownloads = json.data.downloads || 'Unknown';

            // Get current date and time in UTC
            const currentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

            // Construct the response message
            let text = `乂  *M E D I A F I R E*\n\n`;
            text += `*📂 Name:* ${fileName}\n`;
            text += `*💾 Size:* ${fileSize}\n`;
            text += `*📄 Extension:* ${fileExtension}\n`;
            text += `*📑 Mime:* ${fileMime}\n`;
            text += `*📦 Bytes:* ${fileBytes ? fileBytes.toLocaleString() : 'Unknown'}\n\n`;
            text += `*🗓️ Uploaded:* ${fileUploaded}\n`;
            text += `*📥 Downloads:* ${fileDownloads}\n`;
            text += `*⏰ Downloaded on:* ${currentDateTime} UTC\n`;
            text += `*👤 Downloaded by:* ${m.pushName || 'Unknown'}\n\n`;
            text += `🔗 *[Verify Link](${args[0]})*\n\n`;
            text += `*🔍 Additional Information:*\n`;
            text += `- Ensure you have enough space before downloading.\n`;
            text += `- Check the file extension before opening.\n`;
            text += `- Avoid downloading files from untrusted sources.\n\n`;
            text += `----------------------------------------\n`;
            text += global.footer;

            // Check file size limit
            const chSize = Func.sizeLimit(fileSize, users.premium ? env.max_upload : env.max_upload_free);
            const isOver = users.premium 
                ? `💀 File size (${fileSize}) exceeds the maximum limit.` 
                : `⚠️ File size (${fileSize}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`;

            if (chSize.oversize) {
                return client.reply(m.chat, isOver, m);
            }

            // Send file details message with action buttons
            await client.sendMessageModify(m.chat, text, m, {
                largeThumb: true,
                thumbnail: 'https://telegra.ph/file/fcf56d646aa059af84126.jpg',
                buttons: [
                    { buttonId: fileLink, buttonText: { displayText: '📥 Download File' }, type: 1 },
                    { buttonId: args[0], buttonText: { displayText: '🔗 Verify Link' }, type: 1 }
                ],
                headerType: 4
            }).then(async () => {
                // Send the file
                client.sendFile(m.chat, fileLink, fileName, '', m);
            });

        } catch (e) {
            console.error(e);
            // Send detailed error message to WhatsApp
            const errorMessage = `⚠️ An error occurred:\n\n${e.message}\n\nStack Trace:\n${e.stack}`;
            client.reply(m.chat, errorMessage, m);
        }
    },
    error: false,
    limit: true,
    cache: true,
    location: __filename
};