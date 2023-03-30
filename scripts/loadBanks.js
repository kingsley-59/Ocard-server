// the bank list generated from this script is both okra and paystack compliant

const { default: axios } = require("axios");
const fs = require('fs/promises');
const path = require("path");

const BankDictionary = new Map();

async function loadBanksFromPaystack() {
    const apiUrl = 'https://api.paystack.co/bank';
    
    const { data } = await axios.get(apiUrl);
    const banks = data?.data || [];
    console.log(`${banks.length} banks loaded from Paystack`);

    return banks;
}

async function loadBanksFromOkra() {
    const apiUrl = 'https://api.okra.ng/v2/banks/list';

    const { data } = await axios.get(apiUrl);
    const banks = data?.data?.banks || [];
    console.log(`${banks.length} banks loaded from Okra`);

    return banks;
}

async function generateBanksData() {
    const paystackBanks = await loadBanksFromPaystack();
    const okraBanks = await loadBanksFromOkra();

    console.log('Reading data from okra banks');
    for (let bank of okraBanks) {
        let { name, icon, ussd, corporate, countries } = bank;
        BankDictionary.set(bank.sortcode, {name, icon, ussd, corporate, countries});
    }
    console.log('Done.');
    console.log(`Bank dictionary contains ${BankDictionary.size} bank(s).`);

    console.log('Reading data from paystack banks');
    let containsSameCount = 0;
    for (let bank of paystackBanks) {
        let bankExists = BankDictionary.has(bank.code);
        if (bankExists) {
            containsSameCount++ ;
            const { code, slug, pay_with_bank, active } = bank;
            const bankUpdate = {...BankDictionary.get(bank.code), code, slug, pay_with_bank, active};
            BankDictionary.set(bank.code, bankUpdate);
        } else {
            const { code, slug, pay_with_bank, active } = bank;
            BankDictionary.set(bank.code, { name: bank.name, code, slug, pay_with_bank, active });
        }
    }
    console.log('Done.');
    console.log(`${containsSameCount} banks exist in both datasets`);
}

async function saveObjectToJsonFile(obj = {}) {
    try {
        const controller = new AbortController();
        const { signal } = controller;
        const data = new Uint8Array(Buffer.from(JSON.stringify(obj, null, 2)));
        await fs.writeFile(path.join(__dirname, '/../banks.json'), data, { signal });
    } catch (error) {
        console.log(error);
    }
}

generateBanksData().then(async () => {
    console.log('Merge complete.');
    console.log(`Bank dictionary now contains ${BankDictionary.size} bank(s).`);

    await saveObjectToJsonFile(Object.fromEntries(BankDictionary));
    BankDictionary.clear();
}).catch(error => {
    console.log('Something went wrong.');
    console.log(error);
});
