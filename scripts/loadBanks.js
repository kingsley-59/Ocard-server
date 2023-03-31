// the bank list generated from this script is both okra and paystack compliant

const { default: axios } = require("axios");
const fs = require('fs/promises');
const path = require("path");


function compare(a, b) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}

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

async function generateBanksData(sort = false) {
    const BankDictionary = new Map();

    const paystackBanks = await loadBanksFromPaystack();
    const okraBanks = await loadBanksFromOkra();

    console.log('Reading data from okra banks');
    for (let bank of okraBanks) {
        let { name, icon, ussd, corporate, countries } = bank;
        BankDictionary.set(bank.slug, { name, icon, ussd, corporate, countries });
    }
    console.log('Done.');
    console.log(`Bank dictionary contains ${BankDictionary.size} bank(s).`);
    // console.log(BankDictionary.entries());

    const banksWithoutIcons = new Map();
    console.log('Reading data from paystack banks');
    for (let bank of paystackBanks) {
        let bankExists = BankDictionary.has(bank.slug);
        if (bankExists) {
            const { code, slug, pay_with_bank, active } = bank;
            const bankUpdate = { ...BankDictionary.get(bank.slug), code, slug, pay_with_bank, active };
            BankDictionary.set(bank.slug, bankUpdate);
        } else {
            const { name, code, slug, pay_with_bank, active } = bank;
            banksWithoutIcons.set(bank.slug, { name, code, slug, pay_with_bank, active });
        }
    }
    console.log('Done.');

    console.log('Adding banks without icon to Bank dictionary');
    banksWithoutIcons.forEach(bank => {
        const { name, code, slug, pay_with_bank, active } = bank;
        BankDictionary.set(bank.slug, { name, code, slug, pay_with_bank, active });
    });
    console.log('Done.');

    if (sort) {
        console.log('Sorting banks disctionary');
        const mapSort = new Map([...BankDictionary.entries()].sort((a, b) => { console.log([a, b]); return compare(a[0], b[0]); }));
        console.log('Done');

        return mapSort;
    } else {
        return BankDictionary;
    }
}

async function saveObjectToJsonFile(obj = {}) {
    try {
        const controller = new AbortController();
        const { signal } = controller;
        const data = new Uint8Array(Buffer.from(JSON.stringify(obj, null, 2)));
        await fs.writeFile(path.join(__dirname, '/../public/banks.json'), data, { signal });
    } catch (error) {
        console.log(error);
    }
}


async function loadBanks(sort = false) {
    try {
        const data = await generateBanksData(sort);
        console.log('Merge complete.');
        console.log(`Bank dictionary now contains ${data.size} bank(s).`);

        await saveObjectToJsonFile(Object.fromEntries(data));
    } catch (error) {
        console.log('Something went wrong.');
        console.log(error);
    }
}

loadBanks(true);