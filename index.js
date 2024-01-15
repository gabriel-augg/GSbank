const inquirer = require('inquirer')
const chalk = require('chalk')
const fs = require('fs')
const log = console.log
const clear = console.clear


const operations = () => {
    clear()
    log(chalk.bgMagenta.white.bold('----------GSBank-----------'))
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
    clear()
    log(chalk.bgMagenta.white.bold('Obrigado por usar o GSBank!'))
    process.exit()
}

function createAccount(){
    clear()
    log(chalk.bgMagenta.white.bold('Obrigado por escolher o GSBank, o Banco que realmente se importa com você. \n'))
    log(chalk.magenta.bold('Para começar, nós precisamos que você digite o seu nome, o seu último nome e uma senha. \n'))
    buildAccount()
}

function buildAccount(){
    inquirer.prompt([
        {
            name: 'userName',
            message: 'Primeiro, precisamos que você digite o seu nome: '
        },
        {
            name: 'lastName',
            message: 'Agora precisamos do seu último nome: '
        },
        {
            name: 'password',
            message: 'Para sua segurança, digite uma senha (minimo: 8 caracteres): '
        },
        {
            name: 'repassword',
            message: 'Por fim, digite sua senha novamente para gente confirmar'
        }
    ])
    .then( answer => {
        const userName = answer['userName']
        const lastName = answer['lastName']
        const password = answer['password']
        const repassword = answer['repassword']
        const accountNumber = createAccountNumber()

        if(!userName || !lastName || !password || password != repassword || password.length < 8){

            const message = 'Parece que ocorreu um erro, por favor, selecione uma das opções abaixo'
            return erroOptions(buildAccount, message, operations)
        }

        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts')
        }


        fs.writeFileSync(`accounts/${accountNumber}.json`, `{"name": "${userName}", "lastname": "${lastName}", "password": "${password}","accountNumber": ${accountNumber}, "balance": 0, "investment": 0 }`, err => log(err))

        clear()

        log(chalk.bgMagenta.white.bold(`Só um momento ${userName}, estamos criando a sua conta...`))

        setTimeout(() => {
            clear()
            log(chalk.bgMagenta.white.bold('PARABÉNS!\n'))
            log(chalk.bgMagenta.white.bold(`Sua conta foi criada com sucesso e agora você pode acessa-la com a sua senha e o número abaixo.`))
            log(chalk.bgMagenta.white.bold("Guarde esse número em algum lugar, você só pode logar com ele.\n"))
            log(chalk.magenta.bold(`Número: ${accountNumber}`))
        }, 3000)

        setTimeout(()=> {
            operations()
        }, 17000)


    })
    .catch(err => log(err))
}

function createAccountNumber(){
    let accountNumber;
    do {
        accountNumber = Math.floor(Math.random() * 900) + 100
    } while (fs.existsSync(`accounts/${accountNumber}.json`))
    return accountNumber
}

function login(){
    clear()
    log(chalk.bgMagenta.white.bold('----------GSBank-----------'))
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

            const message = 'Essa conta não existe ou a senha está incorreta, por favor, selecione uma das opções abaixo'
            return erroOptions(loginWithNumberAndPassword, message, login)
        }


        const accountData = getAccountData(accountNumber)


        fs.writeFileSync('loggedAccount.json', JSON.stringify(accountData), err => log(err + ' FOIIIIII'))



        clear()

        log(chalk.bgMagenta.white.bold('Aguarde só um momento que estamos logando na sua conta...'))




        setTimeout(()=> {
            clear()
            log(chalk.bgMagenta.white.bold('Logado com sucesso! Agora você pode acessar todos os recursos da sua conta.'))
        },5000)

        setTimeout(()=> {
            clear()
            loggedOperations()
        },8000)

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
    log(chalk.bgMagenta.white.bold('----------GSBank-----------'))
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

        if(!amount || amount <= 0){
            const message = 'Parece que houve um erro, por favor, selecione uma das opções abaixo'
            return erroOptions(deposit, message, loggedOperations)
        }

        fs.writeFileSync('loggedAccount.json', JSON.stringify(account), err => log(err))
        fs.writeFileSync(`accounts/${account.accountNumber}.json`, JSON.stringify(account),err => log(err))
        clear()
        log(chalk.bgMagenta.white.bold(`${account.name}, o saldo no valor de R$${amount} foi adicionado com sucesso!`))
        setTimeout(()=> {
            clear()
            loggedOperations()
        }, 3000)
    })
    .catch(err => log(err))
}

function getAccountBalance(){
    const account = getLoggedAccountData()
    console.log(chalk.bgMagenta.white.bold(`${account.name}, O seu saldo é de R$${account.balance}.`))
    setTimeout(()=> {
        clear()
        loggedOperations()
    }, 3000)
}

function widthdraw(){
    clear()
    inquirer.prompt([
        {
            name: 'amount',
            message: 'Digite o valor que você deseja sacar: '
        }
    ])
    .then(answer => {
        const amount = answer['amount']
        const account = getLoggedAccountData()

        if(!amount || amount <= 0){
            const message = 'Parece que houve um erro, por favor, selecione uma das opções abaixo'
            return erroOptions(widthdraw, message, loggedOperations)
        }

        if(amount > account.balance){

            const message = 'Valor insuficiente para saque, por favor, selecione uma das opções abaixo'
            return erroOptions(widthdraw, message, loggedOperations)
        }

        account.balance = parseFloat(account.balance) - parseFloat(amount)

        fs.writeFileSync('loggedAccount.json', JSON.stringify(account), err => log(err))
        fs.writeFileSync(`accounts/${account.accountNumber}.json`, JSON.stringify(account),err => log(err))
        clear()
        log(chalk.bgMagenta.white.bold(`${account.name}, o saque no valor de R$${amount} foi concluído com sucesso!`))
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

        if(!amount || amount <= 0){
            
            const message = 'Parece que houve um erro, por favor, selecione uma das opções abaixo'
            return operations(investment, message, loggedOperations)
        }

        if(account.balance < amount){

            const message = 'Parece que você não tem esse valor disponível para investimento, por favor, selecione uma das opções abaixo'
            return erroOptions(investment, message, loggedOperations)
        }

        account.investment = parseFloat(account.investment) + parseFloat(amount)
        account.balance = parseFloat(account.balance) - parseFloat(amount)

        fs.writeFileSync('loggedAccount.json', JSON.stringify(account), err => log(err))
        fs.writeFileSync(`accounts/${account.accountNumber}.json`, JSON.stringify(account),err => log(err))
        clear()
        log(chalk.bgMagenta.white.bold(`${account.name}, o investimento no valor de R$${amount} foi concluído com sucesso!`))
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
    log(chalk.bgMagenta.white.bold(`${account.name}, você tem investido um valor de R$${account.investment}.`))
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

        if(!amount || amount <= 0){
            const message = 'Parece que houve um erro, por favor, selecione uma das opções abaixo'
            return erroOptions(widthdrawInvestment, message, loggedOperations)
        }
        
        if(account.investment < amount){
            const message = 'Valor de saque de investimento indisponivel, por favor, selecione uma das opções abaixo'
            return erroOptions(widthdrawInvestment, message, loggedOperations)
        }

        account.investment = parseFloat(account.investment) - parseFloat(amount)
        account.balance = parseFloat(account.balance) + parseFloat(amount)

        fs.writeFileSync('loggedAccount.json', JSON.stringify(account), err => log(err))
        fs.writeFileSync(`accounts/${account.accountNumber}.json`, JSON.stringify(account),err => log(err))
        clear()
        log(chalk.bgMagenta.white.bold(`${account.name}, o saque de investimento no valor de R$${amount} foi concluído com sucesso!`))
        setTimeout(()=> {
            clear()
            loggedOperations()
        }, 3000)
    })
    .catch(err => log(err))
}

function recoverPassword(){
    clear()
    log(chalk.bgMagenta.white.bold('-----Recuperação de senha-----'))
    inquirer.prompt([
        {
            name: 'accountNumber',
            message: 'Por favor, digite o número da sua conta: '
        }
    ])
    .then(answer => {
        const accountNumber = answer['accountNumber']


        if(!accountNumber){
            const message = 'Parece que houve um erro, por favor, selecione uma das opções abaixo'
            return erroOptions(recoverPassword, message, operations)
        }

        if(!fs.existsSync(`accounts/${accountNumber}.json`)){
            const message = 'Parece que essa conta não existe, por favor, selecione uma das opções abaixo'
            return erroOptions(recoverPassword, message, operations)
        }

        const account = getAccountData(accountNumber)

        log(chalk.bgMagenta.white.bold('Para prosseguir com a sua alteração de senha, precisamos que você digite o seu nome e seu último nome corretamente.'))

        inquirer.prompt([
            {
                name: 'userName',
                message: 'Para começar, digite o nome cadastrado na sua conta:'
            },
            {
                name: 'lastName',
                message: 'Continuando, precisamos do seu último nome: '
            },
            {
                name: 'password',
                message: 'Agora precisamos que você digite sua nova senha (minimo 8 caracteres): '
            },
            {
                name: 'repassword',
                message: 'E por fim, precisamos que você digite novamente sua senha só para a gente confirmar: '
            }
        ])
        .then( answer => {

            const userName = answer['userName']
            const lastName = answer['lastName']
            const password = answer['password']
            const repassword = answer['repassword']

            if(!userName || !lastName || !password || password != repassword || password.length < 8){

                const message = 'Parece que ocorreu um erro, por favor, selecione uma das opções abaixo'
                return erroOptions(recoverPassword, message, operations)
            }


            if(userName != account.name || lastName != account.lastname){

                const message = 'Parece que o seu nome ou o seu último nome está incorreto, por favor, selecione uma das opções abaixo'
                return erroOptions(recoverPassword, message, operations)
            }

            account.password = password

            fs.writeFileSync(`accounts/${accountNumber}.json`, JSON.stringify(account), err => log(err))

            clear()

            log(chalk.bgMagenta.white.bold(`${account.name}, sua senha foi alterada, agora você pode acessar a sua conta.`))

            setTimeout(()=>{
                clear()
                operations()
            },4000)
        })
        .catch(err => log(err))
    })
    .catch(err => log(err))
}

function erroOptions(tryAgain, message, back){
    clear()
    log(chalk.bgRed.white.bold(message))

    setTimeout(()=>{
        inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Opções disponíveis:',
                choices: ['Tentar novamente', 'Voltar']
            }
        ])
        .then( answer => {
            const action = answer['action']
    
            if(action == 'Tentar novamente'){
                tryAgain()
            } 
    
            if(action == 'Voltar'){
                back()
            }
        })
        .catch(err => log(err))
    }, 2000)

    
}


