const axios = require("axios");

export default async function handler(req, res) {
    const { query } = req; 
    
    if (!query['openid.claimed_id']) {
        return res.status(400).json({ error: 'ההתחברות לא הצליחה' });
    }

    const steamUserId = query['openid.claimed_id'];

    return res.redirect(`/homepage?steamUserId=${steamUserId}`);
}
