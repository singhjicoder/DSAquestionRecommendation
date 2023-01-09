const puppy=require("puppeteer");
const fs = require("fs");
const { scrollPageToBottom }=require("puppeteer-autoscroll-down");
const tagsFileObj=require('./tags.json');

//Global Information
let obj={};

async function main()
{
    let browser=await puppy.launch({
        headless: false,
        defaultViewport: false,
        args:['--start-maximized']    //To make Browser Fullscreen.
    });
    let tabs=await browser.pages();
    let tab=tabs[0];
    await tab.goto("https://leetcode.com/problemset/all/?page=1");
    await data(tab,browser);
}

async function data(tab,browser)
{
    let k=1;
    let z=-1;
    let questionNameArr=[];
    for(let j=1;j<=48;j++) //j<=2 means 1st and 2nd page only
    {
        const lastPosition=await scrollPageToBottom(tab,{
            size: 500,
            delay: 250
        });
        await tab.waitForSelector("div[role='table'] ",{visible: true});
        let questionNameList=await tab.$$("div[role='rowgroup'] div[role='row'] a.h-5");

        let url=await tab.$$eval("div[role='rowgroup'] div[role='row'] a.h-5",el => el.map(x => x.getAttribute("href")));

        let acceptancePercentageList=await tab.$$("div[role='rowgroup'] div[role='row'] div:nth-child(4) span");

        let difficultyLevelList=await tab.$$("div[role='rowgroup'] div[role='row'] div:nth-child(5) span");

        let x=-1;
        for(let i=0;i<questionNameList.length;i++)
        {
            z++;
            x++;
            let obj={};

            let text1=await tab.evaluate(function(ele) {
                return ele.textContent;
            }, questionNameList[i]);

            let res = text1.split(". ");

            let text2=await tab.evaluate(function(ele) {
                return ele.textContent;
            }, acceptancePercentageList[i]);

            let text3=await tab.evaluate(function(ele) {
                return ele.textContent;
            }, difficultyLevelList[i]);

            if(tagsFileObj.key[z].length==0)
            {
                continue;
            }

            obj["id"]=z;
            obj["questionName"]=res[1];
            obj["questionURL"]="https://leetcode.com"+url[x];
            obj["acceptancePercentage"]=text2;
            obj["difficultyLevel"]=text3;
            obj["questionTags"]=tagsFileObj.key[z];
            questionNameArr.push(obj);
        }
    
        k++;
        await tab.goto(`https://leetcode.com/problemset/all/?page=${k}`);
    }
    questionNameArr.shift();
    console.log(questionNameArr);
    let myObj={
        root: {
            questions: questionNameArr
        }
    };
    fs.writeFileSync("leetcodeQuestions.json", JSON.stringify(myObj));
}

async function tagsFunc(tab,browser)
{
    let k=25;
    for(let j=1;j<=12;j++) //j<=2 means 1st and 2nd page only
    {
        let tagsArr=[];
        const lastPosition=await scrollPageToBottom(tab,{
            size: 500,
            delay: 250
        });
        await tab.waitForSelector("div[role='table'] ",{visible: true});

        let questionNameList=await tab.$$("div[role='rowgroup'] div[role='row'] a.h-5");
        let url=await tab.$$eval("div[role='rowgroup'] div[role='row'] a.h-5",el => el.map(x => x.getAttribute("href")));

        let x=-1;
        for(let i=0;i<questionNameList.length;i++)  
        {
            x++;
            let currURL=await tab.url();

            await tab.goto(`https://leetcode.com${url[x]}`);

            let last1Position=await scrollPageToBottom(tab,{
                size: 500,
                delay: 250
            });

            try {
              await tab.waitForSelector(".description__24sA", {timeout: 10000});
            } catch (err) {
                tagsArr.push([]);
                console.log([]);
                await tab.goto(currURL);

                const last2Position=await scrollPageToBottom(tab,{
                    size: 500,
                    delay: 250
                });
                await tab.waitForSelector("div[role='table'] ",{visible: true});
                continue;
            }
            
            await tab.waitForSelector("div[data-key='description-content']",{visible: true});
            
            await tab.waitForSelector(".description__24sA",{visible: true});

            let tagsList=await tab.$$(".description__24sA div:nth-child(5) div:nth-child(2) a");

            let tags=[];
            for(let y=0;y<tagsList.length;y++)
            {
                let text4=await tab.evaluate(function(ele) {
                    return ele.textContent;
                }, tagsList[y]);
                tags.push(text4);
            }

            console.log(i);
            console.log(tags);
            tagsArr.push(tags);
            await tab.goto(currURL);

            const last2Position=await scrollPageToBottom(tab,{
                size: 500,
                delay: 250
            });
            await tab.waitForSelector("div[role='table'] ",{visible: true});
        }
        let obj={
            key: tagsArr
        };
        fs.writeFileSync(`tags${k}.json`, JSON.stringify(obj));
        k++;
        await tab.goto(`https://leetcode.com/problemset/all/?page=${k}`);
    }
}
main();