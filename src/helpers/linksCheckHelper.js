function checkLinks(sender,linksArr){
    if(!linksArr)
        throw new Error("Unable to check links, coz linksArr is null!");
    let index = 0;
    for(link in linksArr) {
        if(!link)
            throw new Error(`Links from ${sender} with index ${index} is NULL!!!`);
        index++;
    }
}

module.exports = checkLinks;