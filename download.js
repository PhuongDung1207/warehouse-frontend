const https = require('https');
const fs = require('fs');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function main() {
  const url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2E4MWQzMjkwMzhlNzQxMWU4MjY2NzU5MGQ3ZDE4YmY2EgsSBxDKtomjxg4YAZIBJAoKcHJvamVjdF9pZBIWQhQxMjc2NzI2NzI0Nzc2NDc0MDk1NQ&filename=&opi=89354086";
  
  try {
    console.log("Downloading stock out...");
    await download(url, "c:/ThreeTech/quanlikho/congcu/warehouse-frontend/stitch_designs/stock_out.html");
    console.log("Done");
  } catch (err) {
    console.error(err);
  }
}
main();
