import fs from 'fs';

fs.mkdirSync('lib/resources', { recursive: true });

fs.cpSync('src/resources/', 'lib/resources/', { recursive: true });
