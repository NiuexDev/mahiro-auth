export const mysqlTable = `
id INT AUTO_INCREMENT PRIMARY KEY,
email VARCHAR(255) NOT NULL,
password VARCHAR(255) NOT NULL,
uuid CHAR(32) NOT NULL,
name VARCHAR(255),
skin VARCHAR(255),
cape VARCHAR(255)`

export const sqliteTable = `
id INTEGER PRIMARY KEY AUTOINCREMENT,
email TEXT NOT NULL,
password TEXT NOT NULL,
uuid TEXT NOT NULL,
name TEXT,
skin TEXT,
cape TEXT`