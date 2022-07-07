export class ObjectPoolItem<T>{
    obj     : T;
    inUse   = false;
    constructor( obj: T ){ this.obj = obj; }
}

export default class ObjectPool<T>{
    // #region MAIN
    active     : Array<ObjectPoolItem<T>> = []; // Objects currently in Use
    cache      : Array<ObjectPoolItem<T>> = []; // Objects available to be recycled

    onCreate   : () => T;                       // Function that creates a new Object for the pool
    onRecycle ?: ( o: T ) => void;              // Optional function to handle any custom recycling on the object
    
    constructor( createHandler: ()=>T, recycleHandler: (o:T)=>void | undefined ){
        this.onCreate  = createHandler;
        this.onRecycle = recycleHandler;
    }
    // #endregion

    // #region METHODS
    get(): T {
        let itm : ObjectPoolItem<T> | undefined = this.cache.pop();
        if( !itm ) itm = new ObjectPoolItem( this.onCreate() );

        itm.inUse = true;
        this.active.push( itm );
        return itm.obj;
    }
    // #endregion
    
    // #region RECYCLE
    recycleAll(): this {
        let itm : ObjectPoolItem<T> | undefined;
        while( (itm = this.active.pop()) !== undefined ){
            if( this.onRecycle ) this.onRecycle( itm.obj );
            itm.inUse = false;
            this.cache.push( itm );
        }

        return this;
    }

    recycleItem( obj: T): this {
        for( const [idx,itm] of this.active.entries() ){
            if( itm.obj === obj ){
                if( this.onRecycle ) this.onRecycle( obj ); 

                // Remove from Active Use
                this.active.splice( idx, 1 );

                // Store back to cache
                itm.inUse = false;
                this.cache.push( itm );
                break;
            }
        }

        return this;
    }
    // #endregion
}