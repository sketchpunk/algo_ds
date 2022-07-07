export class Node<T>{
    value : T | null;
    prev  : Node<T> | null = null;
    next  : Node<T> | null = null;
    constructor( v : T ){ this.value = v; }
}

export default class CircularLinkedList<T>{
    // #region MAIN
    head  : Node<T> | null = null; // Starting Node
    tail  : Node<T> | null = null; // Last node before repeating
    count               = 0;       // How Many nodes added to list
    //constructor(){}
    // #endregion

    // #region METHODS
    add( v: T ): Node<T>{
        const n = new Node<T>( v );
        this.count++;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Empty Linked List, Easy to setup
        if( !this.head || !this.tail ){
            this.head = n;
            this.tail = n;
            n.next    = n;
            n.prev    = n;
            return n;
        }
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        n.prev          = this.tail;        // New Node Lives between the Tail
        n.next          = this.tail.next;   // And Its Circular Next, Which should be Head
        this.tail.next  = n;                // The Previous Tail's Next should be new Node
        this.tail       = n;                // New Node becomes new tail
        this.head.prev  = n;                // Head loops backward to tail

        return n;
    }

    clear() : CircularLinkedList<T>{
        if( !this.head ) return this;

        let p : Node<T> | null, 
            n : Node<T> | null = this.head;

        do{
            p       = n;
            n       = n.next;

            p.value = null;
            p.next  = null;
            p.prev  = null;
        }while( n !== this.head && n != null );

        this.head   = null;
        this.tail   = null;
        this.count  = 0;

        return this;
    }
    // #endregion

    // #region GETTERS
    size() : number{
        if( !this.head ) return 0;

        let n : Node<T> | null = this.head;
        let cnt = 0;

        do{
            cnt++;
            n = n.next;
        }while( n !== this.head && n != null );

        return cnt;
    }

    findNode( v: T ) : Node<T> | null{
        if( !this.head ) return null;

        let n : Node<T> | null = this.head;
        do{
            if( n.value === v ) return n;
            n = n.next;
        }while( n !== this.head && n != null );

        return null;
    }
    // #endregion

    // #region ITERATORS
    iter( n : Node<T> | null = null ) : { [Symbol.iterator]() : { next:()=>{ value:T | null, done:boolean } } }{
        const result : { value:T|null, done:boolean } = { value: null, done:false };
        const first : Node<T> | null = n || this.head;
        let node     = first;

        const next   = ()=>{
            if( !node ) result.done = true;
            else{
                result.value = node.value;
                // If next Item in Linked List, but since its circular, need to 
                // test if the next item is the first item.
                node = ( node.next !== first )? node.next : null;
            }
            return result;
        };

        return { [Symbol.iterator](){ return { next }; } };
    }
    // #endregion
}