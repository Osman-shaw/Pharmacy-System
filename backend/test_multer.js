try {
    const multer = require('multer');
    console.log('Multer loaded successfully');
    console.log('Version:', require('multer/package.json').version);
} catch (err) {
    console.error('Failed to load multer:', err.message);
    console.error('Search paths:', module.paths);
}
