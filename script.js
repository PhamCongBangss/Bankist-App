'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Cong Bang',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'vi-VN', // de-DE
};

const account2 = {
  owner: 'Bao Pham',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2024-05-28T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'vi-VN',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

//CREATEUSERNAME
const createUsersName = function (accs) {
  accs.forEach(function (acc) {
    acc.user = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsersName(accounts);

const startLogOutTimer = function () {
  const tick = function () {
    const min = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const sec = `${time % 60}`.padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = '0';
      labelWelcome.textContent = 'Log in to get started';
    }
    time--;
  };
  let time = 120;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

const createBalance = function (accs) {
  accs.forEach(function (acc) {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  });
};
createBalance(accounts);

const calcPassedDay = (date1, date2) =>
  Math.abs((date2 - date1) / (24 * 60 * 60 * 1000));

const formatMovementDay = function (date, locale) {
  const passedDay = Math.round(calcPassedDay(new Date(), new Date(date)));
  if (passedDay == 0) return 'Today';
  else if (passedDay == 1) return 'Yesterday';
  else if (passedDay <= 7) return `${passedDay} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

//DISPLAY MOVEMENTS
const displayMovements = function (account, sort = false) {
  const mov = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;
  containerMovements.innerHTML = '';
  for (const [idx, movement] of mov.entries()) {
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const displayDate = formatMovementDay(
      new Date(account.movementsDates[idx]),
      account.locale
    );
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${idx} ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${movement.toFixed(2)}€</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  }
};

// CALCULATE AND DISPLAY BALANCE
const calcDisPlayBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `€ ${account.balance.toFixed(2)}`;
};

//DISPLAY SUMMARY
const displaySummary = function (account) {
  const moneyIn = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${moneyIn.toFixed(2)}€`;
  const moneyOut = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(moneyOut.toFixed(2))}€`;
  const moneyInterest = account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * account.interestRate) / 100)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumInterest.textContent = `${moneyInterest.toFixed(2)}€`;
};

//UPDATE UI
const updateUI = function (account) {
  displayMovements(account);
  displaySummary(account);
  calcDisPlayBalance(account);
};

let currentAccount, timer;
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    account => account.user === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // DISPLAY UI
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    updateUI(currentAccount);
    containerApp.style.opacity = '100';
    const options = {
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      month: 'numeric',
      year: 'numeric',
      weekday: 'long',
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(new Date());
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
  }
  inputLoginUsername.value = inputLoginPin.value = '';
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const accountTransfered = accounts.find(
    account => account.user === inputTransferTo.value
  );
  const amount = Number(inputTransferAmount.value);
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    accountTransfered?.user !== currentAccount.user
  ) {
    const now = new Date();
    currentAccount.movementsDates.push(now.toISOString());
    accountTransfered.movementsDates.push(now.toISOString());
    currentAccount.movements.push(-amount);
    accountTransfered.movements.push(amount);
    updateUI(currentAccount);
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.user &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const indexClose = accounts.findIndex(
      acc => acc.user === currentAccount.user
    );
    accounts.splice(indexClose, 1);
    containerApp.style.opacity = '0';
  }
  inputClosePin.value = inputCloseUsername.value = '';
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov > 0.1 * amount)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      const now = new Date();
      currentAccount.movementsDates.push(now.toISOString());
      updateUI(currentAccount);
    }, 3000);
    clearInterval(timer);
    timer = startLogOutTimer();
  }
  inputLoanAmount.value = '';
});

let sort = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sort);
  sort = !sort;
});

//represent time
// const now = new Date();
// const year = now.getFullYear();
// const month = `${now.getMonth() + 1}`.padStart(2, 0);
// const day = `${now.getDate()}`.padStart(2, 0);
// const hour = `${now.getHours()}`.padStart(2, 0);
// const minute = `${now.getMinutes()}`.padEnd(2, 0);
// labelDate.textContent = `${day}/${month}/${year},${hour}:${minute}`;

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
