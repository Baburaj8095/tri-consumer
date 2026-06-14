
const fs = require("fs");
const path = "C:\\\\Users\\\\Baburaj\\\\Desktop\\\\Trikonekt\\\\trikonekt-marketing\\\\tri-consumer\\\\frontend\\\\src\\\\pages\\\\admin\\\\admin.css";
let content = fs.readFileSync(path, "utf8");

// I know that the file was corrupted around `.admin-block-toggle-btn.blocked {`
// Let us just restore from a known good state or fetch the original from git.
