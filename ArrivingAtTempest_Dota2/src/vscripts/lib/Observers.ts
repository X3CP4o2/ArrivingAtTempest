type Listener<T> = (...params: any) => boolean;

export class Observers<T extends string> {
    private listeners: Record<T, Listener<any>[] | null> = {} as Record<T, Listener<any>[] | null>;

    private getOrCreateForKey(key: T): Listener<any>[]{
        if(!this.listeners[key]){
            this.listeners[key] = [];
        }
        return this.listeners[key]!;
    }

    hasListenerKey(key: T){
        return this.listeners[key] && this.listeners[key]!.length != 0;
    }

    addListener(key: T, listener: Listener<any>): number{
        const listeners = this.getOrCreateForKey(key);
        // print("addListener", key);
        for(let i = 1; i <= listeners!.length; i++){
            if(listeners![i]){
                continue;
            }
            listeners![i] = listener;
            return i;
        }
        listeners!.push(listener);
        return listeners!.length;
    }

    removeListener(key: T, index: number){
        if(this.hasListenerKey(key)){
            const listeners = this.listeners![key];
            (<any>listeners)[index] = null
        }  
    }

    nofityListeners(key: T, ...params: any[]): any[]{
        // print("nofityListeners", key);
        if(!this.hasListenerKey(key)){
            return params;
        }
        const listeners = this.listeners[key];

        // LUA adds +1 to i in loop
        for(let i = listeners!.length; i > 0; i--){
            let currentListener: Listener<any> = listeners![i - 1];
            if(currentListener == null){
                continue;
            }
            if(currentListener(params)){
                this.removeListener(key, i - 1);
            }
        }
        return params;
    }
}