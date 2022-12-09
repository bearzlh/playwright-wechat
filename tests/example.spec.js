// @ts-check
const {test} = require('@playwright/test');

test('wx', async ({browser}) => {

    const context = await browser.newContext();

    await context.addCookies([
        {domain:"mp.weixin.qq.com",name:"ua_id",value:"a5kqHTOGTBifjaffAAAAAIEyjBV41qW2mKDuKjVUYPM=",path:"/"},
        {domain:"mp.weixin.qq.com",name:"wxuin",value:"70597299262155",path:"/"},
        {domain:"mp.weixin.qq.com",name:"uuid",value:"5be4fc5fbb90679e6a9390087662cf23",path:"/"},
        {domain:"mp.weixin.qq.com",name:"rand_info",value:"CAESIF815FkXpiyjH7LPZQdApt9DwWZ/28izUd6njIr+rnFE",path:"/"},
        {domain:"mp.weixin.qq.com",name:"slave_bizuin",value:"3807094960",path:"/"},
        {domain:"mp.weixin.qq.com",name:"data_bizuin",value:"3807094960",path:"/"},
        {domain:"mp.weixin.qq.com",name:"bizuin",value:"3807094960",path:"/"},
        {domain:"mp.weixin.qq.com",name:"data_ticket",value:"fI/wfXkhbaw9QAvfMQqzBIJYDFNxsfIVV62MOvu0n8S23Ru+1ySVXEptR/8mHRmf",path:"/"},
        {domain:"mp.weixin.qq.com",name:"slave_sid",value:"aUlHUUFSeDRBbDk4OVB0c3hqaXJ4Y3c2aFZqbTgxVGhkQVoxWjEyNHBIY2tiM0JoaG5MQU03b1VCajJWbUs3QU5ZSGRzMGdtX1NuQlpDT2RXQ1JUanhyMHJWYjZrNEd5R1hiOGJHcEVadUdjS1FZUGM2ZDJ4cmFKNnFrVlNEYUU0eW1YQ3FIcWMySTQ5eWRk",path:"/"},
        {domain:"mp.weixin.qq.com",name:"slave_user",value:"gh_7ce47b5de33b",path:"/"},
        {domain:"mp.weixin.qq.com",name:"xid",value:"72d9b19dd21760552782dc81fde079c1",path:"/"},
        {domain:"mp.weixin.qq.com",name:"mm_lang",value:"zh_CN",path:"/"},
        {domain:"mp.weixin.qq.com",name:"sig",value:"h01f77d7590656bce726f41753eb8dc4b92961373cd8a40c81c87d6b69c6f747dc90342d57dc687598a",path:"/"},
    ])

    const page = await context.newPage()

    await page.goto('https://mp.weixin.qq.com/');
    // await page.waitForResponse('https://mp.weixin.qq.com/cgi-bin/scanloginqrcode*')
    // const qrcodeClass = '.login__type__container__scan__qrcode'
    // await page.locator(qrcodeClass).screenshot({path: "./tmp/screen.png"})

    await page.locator(':visible').getByRole('link', {name: "版本管理"}).click()
    const codeList = page.locator('.code_version_dev .code_version_logs .code_version_log')
    let maxLocator = codeList.nth(0).getByRole('button', {name: "提交审核"})
    let maxTime = await codeList.nth(0).locator('.simple_preview_value').nth(2).textContent()
    for (let i = 1; i< await codeList.count(); i++) {
        let time = await codeList.nth(i).locator('.simple_preview_value').nth(2).textContent()
        if (time > maxTime){
            maxLocator = codeList.nth(i).getByRole('button', {name: "提交审核"})
        }
    }
    console.log(maxTime)
    await page.locator(':visible').getByRole('button', {name:"提交审核"}).nth(1).click()
    await page.locator(':visible').getByText("已阅读并了解平台审核规则").click()
    await page.locator(':visible').getByRole("button",{name: "下一步"}).click()
    await page.locator(':visible').getByRole("button",{ name: '继续提交' }).click()
    await page.locator('.weui-desktop-form__check-label:visible').click()
    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        await page.locator(':visible').getByRole('button', { name: '继续提交' }).click()
    ]);
    await newPage.locator(':visible').getByRole('link', { name: '提交审核' }).click()
    await newPage.screenshot({path: "./tmp/end.png"})
});