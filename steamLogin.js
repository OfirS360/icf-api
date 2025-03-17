export default async function handler(req, res) {
    const STEAM_API_KEY = '3E37434837BF21352A799F672E4062F1'; 
    const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';
  
    const steamLoginUrl = `${STEAM_OPENID_URL}?openid.realm=https://icf.xitsraz.me&openid.return_to=https://icf.xitsraz.me/homepage&openid.mode=checkid_setup`;

    res.redirect(steamLoginUrl);
}