export class DotaPromise<T, R> {

    private onFinally = () => { };

    constructor(
        readonly resolve: (resolve: (resolved: T) => void, reject: (rejected?: R) => void) => void
    ) {
    }

    then(onResolve: (resolved: T) => void, onRejected = (rejected: R) => { }) {
        this.resolve(
            (resolved: T) => {
                onResolve(resolved);
                this.onFinally();
            },
            (rejected?: R) => {
                onRejected(rejected!);
                this.onFinally();
            }
        );
        return this;
    }

    finally(onFinally: () => void) {
        this.onFinally = onFinally;
        return this;
    }

    static Retry<T, R>(times: number, interval: number, promise: DotaPromise<T, R>) {
        return new DotaPromise<any, any>((resolve, reject) => {
            if (times == 0) {
                reject();
                return;
            }
            Timers.CreateTimer(interval,
                () => {
                    promise.then(
                        (resolved) => {
                            resolve(resolved);
                        },
                        (oldRejected) => {
                            DotaPromise.Retry(times - 1, interval, promise).then(resolved => resolve(resolved), rejected => reject(rejected || oldRejected));
                        }
                    );
                }
            );
        });
    }

    /**
     * Resolves after all promises resolved
     * Rejects as soon as the first promise rejects
     * @param promises 
     */
    static All(...promises: DotaPromise<any, any>[]) {
        let length = promises.length;
        return new DotaPromise<any, any>(
            (resolve, reject) => {
                for (let promise of promises) {
                    promise.then(() => {
                        length--;
                        if (length == 0) {
                            resolve(null);
                        }
                    },
                        (rejected) => reject(rejected));
                }
            }
        );
    }

    /**
     * Resolves after the first promise resolved
     * Rejects as soon as the first promise rejects
     * @param promises 
     */
    static Race(...promises: DotaPromise<any, any>[]) {
        let resolved = false;
        return new DotaPromise<any, any>(
            (resolve, reject) => {
                for (let promise of promises) {
                    promise.then((result) => {
                        if (!resolved) {
                            resolve(result);
                        }
                    },
                        (rejected) => reject(rejected));
                }
            }
        );
    }

    static SequenceFrom(index: number, promises: DotaPromise<any, any>[]): DotaPromise<any[], any>{
        return new DotaPromise<any, any>(
            (resolve, reject) => {
                promises[index - 1].then( (oldResult) => {
                    if(index < promises.length){
                        DotaPromise.SequenceFrom(index + 1, promises).then(
                            result => {
                                resolve([oldResult, ...result]);
                            }, 
                            rejected => {reject(rejected);}
                        );
                    } else {
                        resolve([oldResult]);
                    }
                }, 
                (rejected) => reject(rejected));
            }
        );
    }

    /**
     * Resolves after all promises resolved
     * Rejects as soon as the first promise rejects
     * @param promises 
     */
    static Sequence(...promises: DotaPromise<any, any>[]): DotaPromise<any[], any>{
        // DeepPrintTable(promises);
        return DotaPromise.SequenceFrom(1, promises);
    }

    static Resolved(success = true){
        return new DotaPromise<void, number>((resolve, reject) => {
            if(success){
                resolve();
            } else {
                reject();
            }
        });
    }
}

