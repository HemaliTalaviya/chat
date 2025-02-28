var msg = require('../models/Message');

exports.get_msg = async (req,res) => {
    if (!req.session.userId) return res.redirect('/login');
    var data = await msg.find({"recipient":req.session.username});
    
    res.render('chat', { username: req.session.username, data: data });
}