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
  const url1 = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzY2NWEwYTFkOWI0OTQzYzFhZWY1OTE0Y2FlZTk3NWIyEgsSBxDKtomjxg4YAZIBJAoKcHJvamVjdF9pZBIWQhQxMjc2NzI2NzI0Nzc2NDc0MDk1NQ&filename=&opi=89354086";
  const url2 = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2Q2MWY4ZWVkNGU2MzRjYTQ4MThjNzAyMzI5MWVhNDk4EgsSBxDKtomjxg4YAZIBJAoKcHJvamVjdF9pZBIWQhQxMjc2NzI2NzI0Nzc2NDc0MDk1NQ&filename=&opi=89354086";
  const url3 = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzBjMTdiMTA2YWI4YzRjNTlhMzQyOWU4YjFjNzE4NTJhEgsSBxDKtomjxg4YAZIBJAoKcHJvamVjdF9pZBIWQhQxMjc2NzI2NzI0Nzc2NDc0MDk1NQ&filename=&opi=89354086";
  
  try {
    console.log("Downloading login...");
    await download(url1, "c:/ThreeTech/quanlikho/congcu/warehouse-frontend/stitch_designs/login_management.html");
    console.log("Downloading team...");
    await download(url2, "c:/ThreeTech/quanlikho/congcu/warehouse-frontend/stitch_designs/team_management.html");
    console.log("Downloading stock...");
    await download(url3, "c:/ThreeTech/quanlikho/congcu/warehouse-frontend/stitch_designs/stock_in.html");
    console.log("Done");
  } catch (err) {
    console.error(err);
  }
}
main();
