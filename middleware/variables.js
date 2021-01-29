const db = require('../db');

let variables = async () => {
    let varialbes = {};
    const layoutDoc = await db.doc('content/layout').get();

    // header
    variables.title = layoutDoc.data().title;
    variables.headerMenuFeature = layoutDoc.data().headerMenuFeature;
    variables.headerMenuSkill = layoutDoc.data().headerMenuSkill;
    variables.headerMenuOthers = layoutDoc.data().headerMenuOthers;
    variables.headerMenuShop = layoutDoc.data().headerMenuShop;

    // banner
    variables.bannerBg = layoutDoc.data().bannerBg;
    variables.bannerSlogan1a = layoutDoc.data().bannerSlogan1a;
    variables.bannerSlogan1b = layoutDoc.data().bannerSlogan1b;
    variables.bannerSlogan2 = layoutDoc.data().bannerSlogan2;
    variables.bannerSlogan3 = layoutDoc.data().bannerSlogan3;

    return variables;
};

module.exports = variables;