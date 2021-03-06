class ContractDataController {
    constructor() {
        var NebPay = require("nebpay");
        var Nebulas = require("nebulas");
        this.nebPay = new NebPay();
        this.neb = new Nebulas.Neb();
        this.callbackUrl = NebPay.config.mainnetUrl;
        // this.callbackUrl = NebPay.config.testnetUrl;
        this.serialNumber = undefined;
        this.intervalId = undefined;
        this.intervalCount = 0;
    }

    // 컨트랙트 호출
    callSmartContract(func, args, callback) {
        this.serialNumber = this.nebPay.simulateCall(dappAddress, 0, func, args, {
            callback: this.callbackUrl,
            listener: callback,
        });
    }

    // 트랜잭션 전송
    sendTransaction(value, func, args, pendingCallbackListener = undefined, successCallbackListener = undefined, failCallbackListener = undefined) {
        this.serialNumber = this.nebPay.call(dappAddress, value, func, args, {
            callback: this.callbackUrl,
            listener: () => { 
                pendingCallbackListener && pendingCallbackListener();
                this._checkPayInfo(successCallbackListener, failCallbackListener);
            },
        });
    }

    // 4초마다 트랜잭션의 상태를 체크
    _checkPayInfo(successCallbackListener, failCallbackListener) {
        this.intervalId = setInterval(() => {
            this._queryPayInfo(successCallbackListener, failCallbackListener);
            this.intervalCount++;
            console.log(this.intervalId);
            console.log(this.intervalCount);
            if (this.intervalCount > 6) {
                clearInterval(this.intervalId);
                this.intervalCount = 0;
            }
        }, 4000);
    }

    // 트랜잭션 정보 받아옴
    _queryPayInfo(successCallbackListener, failCallbackListener) {
        this.nebPay.queryPayInfo(this.serialNumber, { callback: this.callbackUrl })
            .then(res => {
                var status = JSON.parse(res).data.status;
                var code = JSON.parse(res).code;
                console.log(res);
                // console.log('status : ',status);
                // console.log('code : ', code);
                // tx: pending
                if (status === 1 || status === 0) {
                    if (this.intervalId) clearInterval(this.intervalId);
                    this.intervalCount = 0;
                }
                // tx: succes
                if (status === 1) {
                    successCallbackListener && successCallbackListener();
                }
                // tx: fail
                else if (status === 0 || code === 1) {
                    failCallbackListener && failCallbackListener();
                }
            })
            .catch(err => {
                console.log('ERROR1: ' + err);
            });
    }
}

// module.exports = new ContractDataController();
