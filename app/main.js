const net = require("net");
const fs = require("fs");
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        const url = request.split(" ")[1];
        const headers = request.split("\r\n");
        if (url == "/") {
            socket.write("HTTP/1.1 200 OK\r\n\r\n");
        } else if (url.includes("/echo/")) {
            const content = url.split("/echo/")[1];
            socket.write(
                `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`
            );
        } else if (url.includes("/user-agent")) {
            const userAgent = headers[2].split("User-Agent: ")[1];
            socket.write(
                `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`
            );
        } else if (url.startsWith("/files/")) {
            const directory = process.argv[3];
            const filename = url.split("/files/")[1];
            if (fs.existsSync(`${directory}/${filename}`)) {
                const fileContent = fs
                    .readFileSync(`${directory}/${filename}`)
                    .toString();
                const httpResponse = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}\r\n`;
                socket.write(httpResponse);
            } else {
                socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
            }
        } else {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
        socket.end();
    });
});
server.listen(4221, "localhost", () => {
    console.log("Listening to request");
});