const inquirer = require('inquirer')
const chalk = require('chalk')
const fs = require('fs')
const log = console.log
const clear = console.clear

// pedir nome e sobrenome
// pedir senha
// gerar número de conta
// logar com número de conta e senha
// recuperar senha
// recuperar número de conta

// Serviços: Depósito, Saque, Consultar Saldo, Consultar Investimento, Investir e Sair


const operations = () => {
    clear()
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: ['Entrar','Criar conta', 'Sair']
        }
    ])
    .then( answer => {
        const action = answer['action']
        
        switch (action) {
            case 'Entrar':
                clear()
                login()
                break;
            case 'Criar conta':
                createAccount()
            break;
            case 'Sair':
                exit()
                break;
            default:
                break;
        }

    })
    .catch( err => log(err) )
    
}

operations()

function exit(){
    if(fs.existsSync('loggedAccount.json')){
        fs.unlinkSync('loggedAccount.json', err => log(err))
    }
    log(chalk.bgGray.black.bold('Obrigado por usar o GSBank!'))
    process.exit()
}

function createAccount(){
    log(chalk.bgGreen.black.bold('Obrigado por escolher o GSBank, o Banco que realmente se importa com você. \n'))
    log(chalk.green('Para começar, nós precisamos que você digite o seu nome, o seu sobrenome e uma senha.'))
    buildAccount()
}

function buildAccount(){
    inquirer.prompt([
        {
            name: 'userName',
            message: 'Primeiro, digite o seu primeiro nome: '
        },
        {
            name: 'lastName',
            message: 'Digite o seu último nome: '
        },
        {
            name: 'password',
            message: 'E agora, digite a sua senha (minimo: 8 caracter): '
        },
        {
            name: 'repassword',
            message: 'Por fim, digite sua senha novamente para confirmar'
        }
    ])
    .then( answer => {
        const userName = answer['userName']
        const lastName = answer['lastName']
        const password = answer['password']
        const repassword = answer['repassword']
        const accountNumber = createAccountNumber()

        if(!userName || !lastName || !password || password != repassword || password.length < 8){
            clear()
            log(chalk.bgRed.black('Parece que ocorreu um erro, por favor, tente novamente.'))
            return buildAccount()
        }

        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts')
        }


        fs.writeFileSync(`accounts/${accountNumber}.json`, `{"name": "${userName}", "lastname": "${lastName}", "password": "${password}","accountNumber": ${accountNumber}, "balance": 0, "investment": 0 }`, err => log(err))

        clear()

        log(chalk.bgGray.black.bold(`Só um momento ${userName}, estamos criando a sua conta...`))

        setTimeout(() => {
            clear()
            log(chalk.bgGreen.black.bold('PARABÉNS!\n'))
            log(chalk.bgGray.black.bold(`Sua conta foi criada com sucesso e agora você pode acessa-la com o número abaixo e a sua senha.`))
            log(chalk.bgGray.black.bold("Guarde esse número em algum lugar, você só pode logar com ele.\n"))
            log(chalk.green.bold(`Números: ${accountNumber}`))
        }, 3000)

        setTimeout(()=> {
            operations()
        }, 10000)


    })
    .catch(err => log(err))
}

function createAccountNumber(){
    let accountNumber = Math.floor(Math.random() * 1000)
    while(fs.existsSync(`accounts/${accountNumber}.json`)){
        accountNumber = Math.floor(Math.random() * 1000)
    }
    return accountNumber
}

function login(){
    clear()
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Selecione uma das opções abaixo',
            choices: ['Entrar com numero e senha', 'Esqueci minha senha', 'Voltar']
        }
    ])
    .then(answer => {
        const action = answer['action']

        switch (action) {
            case 'Entrar com numero e senha':
                loginWithNumberAndPassword()
                break;
            case 'Esqueci minha senha':
                recoverPassword()
                break;
            case 'Voltar':
                if(fs.existsSync('loggedAccount.json')){
                    fs.unlinkSync('loggedAccount.json', err => log(err))
                }
                operations()
                break;
            default:
                break;
        }

    })
    .catch(err => log(err))
}

function loginWithNumberAndPassword(){

    inquirer.prompt([
        {
            name: 'accountNumber',
            message: 'Digite seu número de conta: '
        },
        {
            name: 'password',
            message: 'Digite a sua senha: '
        }
    ])
    .then( answer => {
        const accountNumber = parseInt(answer['accountNumber'])
        const password = answer['password']

        log(accountNumber, password)

        if(!checkAccount(accountNumber, password)){
            clear()
            log(chalk.bgRed.black.bold('Essa conta não existe ou a senha está incorreta!'))
            return loginWithNumberAndPassword()
        }


        const accountData = getAccountData(accountNumber)


        fs.writeFileSync('loggedAccount.json', JSON.stringify(accountData), err => log(err + ' FOIIIIII'))

        clear()
        log(chalk.bgGray.black.bold('Logado com sucesso! Agora você pode acessar todos os recursos da sua conta.'))


        setTimeout(()=> {
            clear()
            loggedOperations()
        },3000)

    })
    .catch(err => log(err))
}

function checkAccount(accountNumber, password){
    if(!fs.existsSync(`accounts/${accountNumber}.json`)){
        return false
    } else {
        const accountData = getAccountData(accountNumber)

        if(accountData.password == password){
            return true
        }
        return false
    }

}

function getAccountData(accountNumber) {
    const accountJSON = fs.readFileSync(`accounts/${accountNumber}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

function getLoggedAccountData(){
    const accountJSON = fs.readFileSync(`loggedAccount.json`, {
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

function loggedOperations(){
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: ['Depositar', 'Consultar saldo', 'Sacar', 'Consultar investimento', 'Investir','Sacar investimento', 'Sair']
        }
    ])
    .then( answer => {
        const action = answer['action']
        switch (action) {
            case 'Depositar':
                deposit()
                break;
            case 'Consultar saldo':
                getAccountBalance()
                break;
            case 'Sacar':
                widthdraw()
                break;
            case 'Consultar investimento':
                getInvestment()
                break;
            case 'Investir':
                investment()
                break;
            case 'Sacar investimento':
                widthdrawInvestment()
                break;
            case 'Sair':
                operations()
                break;
            default:
                break;
        }
    })
    .catch(err => log(err))
        
}

function deposit(){
    inquirer.prompt([
        {
            name: 'amount',
            message: 'Digite o valor que você deseja depositar: '
        }
    ])
    .then(answer => {
        const amount = answer['amount']
        const account = getLoggedAccountData()
        account.balance = parseFloat(account.balance) + parseFloat(amount)
        console.log(account.balance)

        if(!amount){
            log(chalk.bgRed.black.bold('Parece que houve um erro, por favor, digite novamente.'))
            return deposit()
        }

        fs.writeFileSync('loggedAccount.json', JSON.stringify(account), err => log(err))
        fs.writeFileSync(`accounts/${account.accountNumber}.json`, JSON.stringify(account),err => log(err))
        clear()
        log(chalk.green.bold(`${account.name}, o saldo de R$${amount} foi adicionado com sucesso!`))
        setTimeout(()=> {
            clear()
            loggedOperations()
        }, 3000)
    })
    .catch(err => log(err))
}

function getAccountBalance(){
    const account = getLoggedAccountData()
    console.log(chalk.bgGray.black.bold(`${account.name}, O seu saldo é de R$${account.balance} !`))
    setTimeout(()=> {
        clear()
        loggedOperations()
    }, 3000)
}

function widthdraw(){
    inquirer.prompt([
        {
            name: 'amount',
            message: 'Digite o valor que você deseja sacar: '
        }
    ])
    .then(answer => {
        const amount = answer['amount']
        const account = getLoggedAccountData()

        if(!amount){
            log(chalk.bgRed.black.bold('Parece que houve um erro, por favor, digite novamente.'))
            return widthdraw()
        }

        if(amount > account.balance){
            log(chalk.bgRed.black.bold('Valor insuficiente para saque, tente novamente!'))
            return widthdraw()
        }

        account.balance = parseFloat(account.balance) - parseFloat(amount)

        fs.writeFileSync('loggedAccount.json', JSON.stringify(account), err => log(err))
        fs.writeFileSync(`accounts/${account.accountNumber}.json`, JSON.stringify(account),err => log(err))
        clear()
        log(chalk.green.bold(`${account.name}, o saque de R$${amount} foi efetuado com sucesso!`))
        setTimeout(()=> {
            clear()
            loggedOperations()
        }, 3000)

    })
    .catch(err => log(err))
}

function investment(){
    inquirer.prompt([
        {
            name: 'amount',
            message: 'Digite o valor que você deseja investir: '
        }
    ])
    .then(answer => {
        const amount = answer['amount']
        const account = getLoggedAccountData()

        if(!amount || amount < 0){
            log(chalk.bgRed.black.bold('Parece que houve um erro, por favor, digite novamente.'))
            return investment()
        }

        if(account.balance < amount){
            log(chalk.bgRed.black.bold('Parece que você não tem esse valor disponível para investimento. Tente novamente'))
            return investment()
        }

        account.investment = parseFloat(account.investment) + parseFloat(amount)
        account.balance = parseFloat(account.balance) - parseFloat(amount)

        fs.writeFileSync('loggedAccount.json', JSON.stringify(account), err => log(err))
        fs.writeFileSync(`accounts/${account.accountNumber}.json`, JSON.stringify(account),err => log(err))
        clear()
        log(chalk.green.bold(`${account.name}, o investimento de R$${amount} foi efetuado com sucesso!`))
        setTimeout(()=> {
            clear()
            loggedOperations()
        }, 3000)

    })
    .catch(err => log(err))
}

function getInvestment(){
    clear()
    const account = getLoggedAccountData()
    log(chalk.bgGray.black.bold(`${account.name}, você tem investido um valor de R$${account.investment}.`))
    setTimeout(()=> {
        clear()
        loggedOperations()
    }, 3000)

}

function widthdrawInvestment(){
    inquirer.prompt([
        {
            name: 'amount',
            message: 'Digite o valor que você deseja tirar do investimento: '
        }
    ])
    .then(answer => {
        const amount = answer['amount']
        const account = getLoggedAccountData()

        if(!amount || amount < 0){
            log(chalk.bgRed.black.bold('Parece que houve um erro, por favor, digite novamente.'))
            return widthdrawInvestment()
        }
        
        if(account.investment < amount){
            log(chalk.bgGray.black.bold('Valor de saque de investimento indisponivel, por favor, digite um valor menor.'))
            return widthdrawInvestment()
        }

        account.investment = parseFloat(account.investment) - parseFloat(amount)
        account.balance = parseFloat(account.balance) + parseFloat(amount)

        fs.writeFileSync('loggedAccount.json', JSON.stringify(account), err => log(err))
        fs.writeFileSync(`accounts/${account.accountNumber}.json`, JSON.stringify(account),err => log(err))
        clear()
        log(chalk.green.bold(`${account.name}, o valor de R$${amount} foi sacado com sucesso do investimento!`))
        setTimeout(()=> {
            clear()
            loggedOperations()
        }, 3000)
    })
    .catch(err => log(err))
}

function recoverPassword(){

    inquirer.prompt([
        {
            name: 'accountNumber',
            message: 'Por favor, digite o número da sua conta: '
        }
    ])
    .then(answer => {
        const accountNumber = answer['accountNumber']


        if(!accountNumber){
            log(chalk.bgRed.black.bold('Parece que houve um erro, por favor, digite novamente.'))
            return recoverPassword()
        }

        if(!fs.existsSync(`accounts/${accountNumber}.json`)){
            clear()
            log(chalk.bgRed.black.bold('Parece que essa conta não existe, por favor, digite novamente o número da conta.'))
            return recoverPassword()
        }

        const account = getAccountData(accountNumber)

        log(chalk.bgGray.black.bold('Para prosseguir com a sua alteração de senha, precisamos que você digite o seu nome e seu último nome corretamente.'))

        inquirer.prompt([
            {
                name: 'userName',
                message: 'Para começar, digite o nome cadastrado na sua conta:'
            },
            {
                name: 'lastName',
                message: 'Seu último nome: '
            },
            {
                name: 'password',
                message: 'Agora precisamos que você digite sua nova senha (minimo 8 caracter): '
            },
            {
                name: 'repassword',
                message: 'E por fim, precisamos que você repita sua senha só para confirmar: '
            }
        ])
        .then( answer => {

            const userName = answer['userName']
            const lastName = answer['lastName']
            const password = answer['password']
            const repassword = answer['repassword']

            if(!userName || !lastName || !password || password != repassword || password.length < 8){
                clear()
                log(chalk.bgRed.black('Parece que ocorreu um erro, por favor, tente novamente.'))
                return recoverPassword()
            }

            console.log(userName, account.name, lastName, account.lastName)

            if(userName != account.name || lastName != account.lastname){

                log(chalk.bgRed.black.bold('Parece que o seu nome ou o seu último nome está incorreto, por favor, digite novamente.'))
                return recoverPassword()
            }

            account.password = password

            fs.writeFileSync(`accounts/${accountNumber}.json`, JSON.stringify(account), err => log(err))

            clear()

            log(chalk.bgGreen.black.bold(`${account.name}, sua senha foi alterada, agora você pode acessar a sua conta.`))

            setTimeout(()=>{
                clear()
                operations()
            },4000)
        })
        .catch(err => log(err))
    })
    .catch(err => log(err))
}


