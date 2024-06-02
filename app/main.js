const net = require("net");
const fs = require("fs");

// check the received message and execute the given instruction
function responseHTTP(msg, request, url, directory) {
    if (request[0] === "GET") {
        // nothing after / means it's ok but nothing to be done
        if (request[1] === "/") return "HTTP/1.1 200 OK\r\n\r\n";
        // echo instruction returns whatever string is given after it
        if (url[1] === "echo")
            return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${url[2].length}\r\n\r\n${url[2]}`;
        // user agent header indicates info about the client
        if (url[1] === "user-agent") {
            const user = msg[2].split(" ")[1];
            return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${user.length}\r\n\r\n${user}`;
        }
        if (url[1] === "files") {
            const filename = url[2];
            const filePath = `${directory}${filename}`;
            // check file in directory
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath).toString();
                return `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`;
            }
        }
        // otherwise nothing can be done yet
        return "HTTP/1.1 404 Not Found\r\n\r\n";
    }
    if (request[0] === "POST") {
        const fileName = url[2];
        const content = msg.pop();
        fs.writeFileSync(`${directory}${fileName}`, content);
        return "HTTP/1.1 201 Created\r\n\r\n";
    }
}
    const server = net.createServer((socket) => {
        socket.on("data", (data) => {
            const msg = data.toString().split("\r\n");
// separate received message in array
            const request = msg[0].split(" ");
            // separate url after GET verb to read instruction
            const url = request[1].split("/");
            const directory = process.argv[3];
            const response = responseHTTP(msg, request, url, directory);
            socket.write(response, () => {
                socket.end();
            });
        });
        // socket.on("close", () => {
        //   socket.end();
        //   server.close();
        // });
    });
    server.listen(4221, "localhost");

