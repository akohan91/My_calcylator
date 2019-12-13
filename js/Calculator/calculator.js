function Display() {
    this._display = document.querySelector(".example");
}

Display.prototype = {
    refresh: function (value) {
        if (value.length === 0)
            this._display.textContent = '0';
        else
            this._display.textContent = value.join('');
        this._textScale();
    },

    get _length() {
        return this._display.textContent.length;
    },

    get _textSize() {
        return this._display.style.fontSize.slice(0, 2);
    },

    set _textSize(value) {
        return this._display.style.fontSize = value
    },

    _textScale: function () {
        let setLength = 8,
            stepTextSize = 5;
        if (this._length >= setLength && this._textSize > 36)
            this._textSize = (68 - (this._length - setLength) * stepTextSize) + 'px';
        else if (this._length < setLength)
            this._textSize = 68 + 'px';
    }
}

function Memory() {
    this._mem = [];
    this._verifer = new Verifer;
}

Memory.prototype = {
    get value() {
        return this._mem;
    },

    get _lastValue() {
        return `${this._mem[this._mem.length - 1]}`
    },

    set _lastValue(btnValue) {
        return this._mem[this._mem.length - 1] = btnValue;
    },

    edit: function (btnValue) {

        if (btnValue instanceof Array)
            this._mem = btnValue;
        else if (btnValue === "ce")
            this._mem = [];
        else if (btnValue === "c")
            this._mem.pop();

        else if (this._verifer.isBrackets(btnValue)) {

            if (btnValue === ')' && (this._verifer.isNum(this._lastValue) || this._lastValue === ')'))
                this._mem.push(btnValue);

            else if (btnValue === '(' && (this._verifer.isZnak(this._lastValue) || this._lastValue === '('))
                this._mem.push(btnValue);

            else if (this._mem === 0 && btnValue === '(')
                this._mem.push(btnValue);

            else return;
        } else if (this._verifer.isZnak(btnValue)) {

            if (this._verifer.isZnak(this._lastValue)) {
                this._lastValue = btnValue;
            } else {
                this._mem.push(btnValue);
            }
        } else if (this._verifer.isNum(btnValue) || btnValue === ".") {
            if (btnValue === '.' && (this._mem == 0 || this._verifer.isZnak(this._lastValue)))
                this._mem.push('0' + btnValue);
            else if (btnValue === '.' && this._lastValue.indexOf('.') !== -1)
                return;
            else if (this._verifer.isNum(this._lastValue)) {
                this._lastValue += btnValue;
            } else
                this._mem.push(btnValue);
        }
    }
}

function Verifer() {}

Verifer.prototype = {
    isZnak: function (x) {
        return (x === '/' || x === '*' || x === '-' || x === '+') ? true : false;
    },

    isBrackets: function (x) {
        return (x === '(' || x === ')') ? true : false;
    },

    isNum: function (x) {
        return (!isNaN(x) || x === ')') ? true : false;
    }
}

function Calculation() {
    this._verifer = new Verifer;

}

Calculation.prototype = {

    result(arr) {
        arr = this._minusToNumber(arr);

        mark: while (arr.length > 1) {
            let calcRange = this._searchBrackets(arr);
            if (calcRange != 0 && calcRange[1] - calcRange[0] == 2) {
                arr.splice(calcRange[1], 1);
                arr.splice(calcRange[0], 1);
                continue mark;
            }
            this._serchDP(arr, calcRange) ? arr = this._calcDP(arr, calcRange) : arr = this._simpleCalc(arr, calcRange);
        }
        return arr;
    },
    /**
     * Преобразует в отрицательное число 
     * @param {Array} arr 
     */
    _minusToNumber: function (arr) {
        arr.forEach((value, i, arr) => {
            if (value == '-' && (!this._verifer.isNum(arr[i - 1]) || this._verifer.isZnak(arr[i - 1])) && arr[i - 1] != ')') {
                arr[i] += arr[i + 1];
                arr.splice(i + 1, 1);
            }
        });
        return arr;
    },
    /**
     * Функция ищет скобки в примере
     * @param {Array} arr  массив с примером
     * @param {Number} firstIndex 
     * @returns calcRange массив с индексами внутренних скобок
     */
    _searchBrackets: function (arr) {
        let firstIndex = 0,
            lastIndex,
            calcRange;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == '(')
                firstIndex = i;
            else if (arr[i] == ')') {
                lastIndex = i;
                break;
            }
        }
        if (lastIndex) return calcRange = [firstIndex, lastIndex];
        else return calcRange = [0, arr.length];
    },
    /**
     * Проверяет пример на наличие умножения и деления
     * @param {Array} arr пример
     * @param {Array} calcRange индексы скобок
     * @returns true or false
     */
    _serchDP: function (arr, calcRange) {
        for (let i = calcRange[0]; i < calcRange[1]; i++) {
            if ((arr[i] == '*' || arr[i] == '/'))
                return true;
        }
    },
    /**
     * Функция вычисляет деление или умножение
     * @param {Array} arr массив с примером
     * @param {Array} calcRange массив с диапозоном поиска в примере
     * @returns приведенный массив с примером
     */
    _calcDP: function (arr, calcRange) {
        let lastIndex = calcRange[1];
        let firstIndex = calcRange[0];
        mark: for (let i = firstIndex; i <= lastIndex; i++) {
            switch (arr[i]) {
                case '*': {
                    arr[i - 1] = arr[i - 1] * arr[i + 1];
                    arr.splice(i, 2);
                    i = firstIndex;
                    lastIndex -= 2;
                }
                continue mark;
            case '/': {
                arr[i - 1] = arr[i - 1] / arr[i + 1];
                arr.splice(i, 2);
                i = firstIndex;
                lastIndex -= 2;
            }
            continue mark;
            }

        }
        return arr;
    },
    /**
     * Функция вычисляет сложение или вычитание
     * @param {Array} arr массив с примером
     * @param {array} calcRange массив с диапозоном поиска в примере
     * @returns приведенный массив с примером
     */
    _simpleCalc: function (arr, calcRange) {
        let lastIndex = calcRange[1];
        let firstIndex = calcRange[0];
        for (let i = firstIndex; i < lastIndex; i++) {
            switch (arr[i]) {
                case '+': {
                    arr[i - 1] = +arr[i - 1] + +arr[i + 1];
                    arr.splice(i, 2);
                    i = firstIndex;
                    lastIndex -= 2;
                }
                break;
            case '-': {
                arr[i - 1] = +arr[i - 1] - +arr[i + 1];
                arr.splice(i, 2);
                i = firstIndex;
                lastIndex -= 2;
            }
            break;
            }
        }
        return arr;
    }

}

function Calculator(innerDom) {

    this.render(innerDom);
    this._display = new Display;
    this._memory = new Memory;
    this._calculation = new Calculation;

    this.btns = $(".btns");

    this.btns.on("click", (e) => {
        if (e.target.value === "=")
            this._memory.edit(this._calculation.result(this._memory.value));
        else
            this._memory.edit(e.target.value);
        this._display.refresh(this._memory.value);
    });
}

Calculator.prototype = {
    render: function (innerDom) {
        document.querySelector(innerDom).innerHTML += `
        <div class="calculator">

            <div class="title-calc">My calculator</div>

            <div class="example" style="Font-Size: 68px">0</div>

            <button class="btns btn-ac" value="ce">ce</button>
            <button class="btns btn-c" value="c">c</button>
            <button class="btns btns-grean" value="/">/</button>
            <button class="btns btns-grean" value="*">*</button>

            <button class="btns" value="7">7</button>
            <button class="btns" value="8">8</button>
            <button class="btns" value="9">9</button>
            <button class="btns btns-grean" value="-">-</button>

            <button class="btns" value="4">4</button>
            <button class="btns" value="5">5</button>
            <button class="btns" value="6">6</button>
            <button class="btns btns-grean" value="+">+</button>

            <button class="btns" value="1">1</button>
            <button class="btns" value="2">2</button>
            <button class="btns" value="3">3</button>
            <button class="btns btns-grean" value="=">=</button>

            <button class="btns" value="0">0</button>
            <button class="btns" value=".">.</button>
            <button class="btns" value="(">(</button>
            <button class="btns" value=")">)</button>

            <div class="footer-calc">Andrew Kakhanouski</div>

        </div>`;

        document.querySelector('head').innerHTML += `
        <style>
            ${innerDom}{
                padding: 20px;
                width: 350px;
                margin: 0 auto;
            }
            
            .calculator {
                display: flex;
                flex-wrap: wrap;
                width: 350px;
                font-family: Arial;
                box-shadow: 0px 0px 50px -4px #000000;
                border-radius: 30px;
            }
            
            .calculator .title-calc {
                width: 100%;
                padding: 5px;
                text-align: center;
                font-size: 20px;
                color: #e6e6e6;
                background-color: #6C7882;
                border-radius: 30px 30px 0 0;
                text-transform: uppercase;
            }
            
            .calculator .example {
                width: 100%;
                min-height: 80px;
                padding: 0 10px;
                background-color: #475762;
                text-align: right;
                color: #e6e6e6;
                word-break: break-all;
            }
            
            .calculator .btns {
                width: 25%;
                padding: 15px 0;
                background: #e6e6e6 !important;
                border: none;
                border-radius: 0px !important;
                margin: 0;
                color: #475762 !important;
                font-size: 1.7em;
                transition-property: background-color, color;
                transition-duration: 300ms;
            }
            
            .calculator .btns:hover {
                background: #6C7882  !important;
                color: #e6e6e6;
                transition-duration: 500ms;
            }
            
            .calculator button:active,
            .calculator button:focus {
                outline: none;
            }
            
            .calculator .btns-grean {
                background: #00AD7C !important;
                color: #e6e6e6 !important;
            }
            
            .calculator .btn-ac {
                background: #E0423D !important;
                color: #e6e6e6 !important;
            }
            
            .calculator .btn-c {
                background: #F05651 !important;
                color: #e6e6e6 !important;
            }
            
            .calculator .footer-calc {
                width: 100%;
                padding: 5px;
                text-align: center;
                font-size: 20px;
                color: #e6e6e6;
                background-color: #6C7882;
                border-radius: 0 0 30px 30px;
                text-transform: uppercase;
            }
        </style> `;
    }
}

