export class Stat {

    private _base: number[] = [];
    private _modifier: number[] = [];
    private _combined: number[] = [];

    private baseDirty = false;
    private modifierDirty = false;
    private combinedDirty = false;

    constructor(public readonly length: number) {
        this.reset();
    }

    reset(){
        for(let i = 0; i < this.length; i++){
            this._base.push(0);
            this._modifier.push(0);
            this._combined.push(0);
        }
    }

    get base(){
        return this._base;
    }

    set base(value: number[]){
        this.baseDirty = this._base !== value;
        this._base = value;
    }

    get modifier() {
        return this._modifier;
    }
    set modifier(value: number[]){
        this.modifierDirty = this._modifier !== value;
        this._modifier = value;
    }

    get combined() {
        return this._combined;
    }
    set combined(value: number[]){
        this.combinedDirty = this._combined !== value;
        this._combined = value;
    }

    isBaseDirty(){
        return this.baseDirty;
    }

    isModifierDirty(){
        return this.modifierDirty;
    }

    isCombinedDirty(){
        return this.combinedDirty;
    }

    combine(): Stat{
        if(this.baseDirty || this.modifierDirty) {
            this.baseDirty = this.modifierDirty = false;
            this.combinedDirty = true;

            this._combined = this._base.map( (value, index) => {
                return value + this._modifier[index];
            });
        }
        return this;
    }

    clearCombinedFlag(): Stat{
        this.combinedDirty = false;
        return this;
    }

    toString(): string {
        let result = "\n[Stat] \n base: [";

        for(let i = 0; i < this._base.length;i++){
            result += this.base[i] + ", ";
        }

        result+= "]\n modifier: [";
        for(let i = 0; i < this._modifier.length;i++){
            result += this._modifier[i] + ", ";
        }

        result+= "]\n combined: [";
        for(let i = 0; i < this._combined.length;i++){
            result += this._combined[i] + ", ";
        }
        result+= "]";

        return result;
    }
}