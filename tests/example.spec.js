// @ts-check
const {test} = require('@playwright/test');

const axios = require('axios')
const crypto = require('crypto')
const fs = require('fs')

const access_token = '06345ee8237dc74f4acabedc6c100d95efee0e5fd1c218a83f5972c2e09458d3';
const secret = 'SECd4e64f1f56e48ce2cf735cd1b84bdf43cc95872a031151b827edec674b659e0a';

test('提交审核 @shenhe', async ({browser}) => {

    let {page, context} = await init(browser)
    await page.getByRole('link', {name: "版本管理"}).click()
    const codeList = page.locator('.code_version_dev .code_version_logs .code_version_log')
    let maxLocator = codeList.nth(0).getByRole('button', {name: "提交审核"})
    let maxTime = await codeList.nth(0).locator('.simple_preview_value').nth(2).textContent()
    for (let i = 1; i < await codeList.count(); i++) {
        let time = await codeList.nth(i).locator('.simple_preview_value').nth(2).textContent()
        if (time > maxTime) {
            maxLocator = codeList.nth(i).getByRole('button', {name: "提交审核"})
        }
    }
    await sendText("最后提交时间:" + maxTime)
    await page.locator(':visible').getByRole('button', {name: "提交审核"}).nth(1).click()
    await page.locator(':visible').getByText("已阅读并了解平台审核规则").click()
    await page.locator(':visible').getByRole("button", {name: "下一步"}).click()
    await page.locator(':visible').getByRole("button", {name: '继续提交'}).click()
    await page.locator(":visible").locator('label').filter({hasText: '地理位置接口新增与相关流程调整'}).click()
    const [newPage] = await Promise.all([context.waitForEvent('page'), await page.locator(':visible').getByRole('button', {name: '继续提交'}).click()]);
    await newPage.locator(':visible').getByRole('link', {name: '提交审核'}).click()

    let fileName = (new Date()).getTime() + ".png";
    await newPage.screenshot({path: "./tmp/" + fileName})
    await sendMarkdown("最终状态:", static_url(fileName))
});

test('提交发布 @fabu', async ({browser}) => {

    let {page} = await init(browser)

    await page.locator(':visible').getByRole('link', {name: "版本管理"}).click()

    if (await page.locator(':visible').getByRole('button', {name: '提交发布'}).count() === 0) {
        let currentVersion = await page.locator('.mod_default_bd.default_box.online_version .simple_preview_item').nth(0).textContent()
        await sendText("无可发布版本，当前:" + currentVersion)
        return;
    }
    await page.locator(':visible').getByRole('button', {name: '提交发布'}).click()

    await page.locator('.js_qr_img.weui-desktop-qrcheck__img-area').screenshot();
})

async function init(browser) {
    let browserOption = {}
    let loginPath = "./tmp/login.json"
    if (fs.existsSync(loginPath)) {
        browserOption = {storageState: loginPath}
    }

    let context = await browser.newContext(browserOption);

    let page = await context.newPage()

    await page.goto('https://mp.weixin.qq.com/');
    let check = await page.locator('.user_name').count()
    if (check === 0) {
        await page.waitForResponse('https://mp.weixin.qq.com/cgi-bin/scanloginqrcode*')
        let fileName = (new Date()).getTime() + ".png";
        const qrcodeClass = '.login__type__container__scan__qrcode'
        await page.locator(qrcodeClass).screenshot({path: `./tmp/${fileName}`})
        await sendMarkdown("请扫码登录", static_url(fileName))
        let username = await page.locator('.user_name').textContent()
        await sendMarkdown("登录成功:" + username)
        await context.storageState({path: loginPath})
    }

    return {page, context}
}

function static_url(name) {
    return `http://static.cps104.dzods.cn/${name}`
}

function sendText(text) {
    let options = ddOptions()
    options.data = {
        msgtype: "text",
        text: {content: text}
    }
    return axios.request(options).then(re => {
        console.log(re.data)
    })
}

function sendMarkdown(title, image) {
    let options = ddOptions()
    options.data = {
        msgtype: "markdown",
        markdown: {
            title: title,
            text: `### ${title}\n![](${image})`
        }
    }
    return axios.request(options).then(re => {
        console.log(re.data)
    })
}

function ddOptions() {
    let timestamp = Date.now();
    let webHookUrl = ddWebHookUrl(timestamp)
    return {
        url: webHookUrl,
        method: 'POST',
        headers: {"Content-Type": "application/json;charset=utf-8"}
    }
}

function ddWebHookUrl(timestamp) {
    if (secret) {
        let sign = ddSign(timestamp)
        return `https://oapi.dingtalk.com/robot/send?access_token=${access_token}&timestamp=${timestamp}&sign=${sign}`
    } else {
        return `https://oapi.dingtalk.com/robot/send?access_token=${access_token}`
    }
}

function ddSign(timestamp) {
    let base64 = crypto.createHmac("sha256", secret)
        .update(timestamp + "\n" + secret)
        .digest()
        .toString("base64");

    return encodeURIComponent(base64)
}