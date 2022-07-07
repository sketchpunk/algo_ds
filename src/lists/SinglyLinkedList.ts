export class Node<T>{
    value : T | null;
    next  : Node<T> | null = null;
    constructor( v : T ){ this.value = v; }
}

export default class SinglyLinkedList<T>{
    // #region MAIN
    head  : Node<T> | null = null; // Starting Node
    tail  : Node<T> | null = null; // Last node before repeating
    count                  = 0;    // How Many nodes added to list
    // #endregion


    // #region ADDING
    /** Add Item to the the end */
    push( v: T ): Node<T>{
        const n = new Node( v );

        if( !this.head ){
            this.head       = n;
            this.tail       = n;
        }else if( this.tail ){
            this.tail.next  = n;
            this.tail       = n;
        }

        this.count++;
        return n;
    }

    /** Add an items to the beginning of the list  */
    unshift( v: T ): Node<T>{
        const n = new Node( v );

        if( !this.head ){
            this.head = n;
            this.tail = n;
        }else{
            n.next    = this.head;
            this.head = n;
        }

        this.count++;
        return n;
    }

    /** Add node between 2 nodes */
    insert( idx:number, v: T ): Node<T> | null{
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( idx == 0 )          return this.unshift( v ); 
        if( idx == this.count ) return this.push( v );

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const n  = this.getNodeAt( idx-1 ); 
        if( n ){
            const nn = new Node( v );
            nn.next  = n.next;  // New Node's next is old node's next
            n.next   = nn;      // Old Node's next is new Node

            this.count++;
            return nn;
        }
        return null;
    }
    // #endregion


    // #region REMOVING
    /** Remove an Item from the End of the List */
    pop(): T | null{
        if( !this.head ) return null;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Find the node before the tail
        let p : Node<T> | null = null;      // Prev Node
        let n : Node<T> | null = this.head;
        while( n.next ){
            p = n; 
            n = n.next;
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Head is the only Node left
        if( p == null ){
            this.head  = null;
            this.tail  = null;
            this.count = 0;
            return n.value;
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Pop Top
        this.tail      = p;
        this.tail.next = null;
        this.count--;

        return n.value;
    }

    // Remove an item from the beginning of the list
    shift(){
        if( !this.head ) return null;

        const n   = this.head;
        this.head = n.next;

        if( !this.head ){
            this.count = 0;
            this.tail  = null;
        }else this.count--;

        return n.value;
    }

    // Remove item at index.
    remove( idx: number ): void{
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( idx == 0 ){ this.shift(); return; }
        if( idx == this.count-1 ){ this.pop(); return; }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const n = this.getNodeAt( idx-1 ); // Get the previous node
        if( n ){
            n.next = n?.next?.next || null;
            this.count--;
        }
    }
    // #endregion


    // #region GETTER // SETTER METHODS
    get( idx: number ): T | null{
        const n = this.getNodeAt( idx );
        return ( n )? n.value : null;
    }

    set( idx: number, v: T ){
        const n = this.getNodeAt( idx );
        if( n ){
            n.value = v;
            return true;
        }
        return false;
    }
    // #endregion


    // #region MISC
    getNodeAt( idx: number ): Node<T> | null{
        if( idx < 0 || idx >= this.count ) return null;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Find the Node before the index
        let n = this.head;
        let i = 0;

        while( i !== idx && n !== null ){ 
            n = n.next; 
            i++;
        }

        return n;
    }

    reverse(): this{
        let next : Node<T> | null = null;
        let prev : Node<T> | null = null;

        let n     = this.head;
        this.head = this.tail;
        this.tail = n;

        while( n ){             // a, b, c, d...
            next    = n.next;   // Save ref to next Item ( B )
            n.next  = prev;     // Set Current to Prev item, if head, null is good because it will be the tail, else B pnts to A
            prev    = n;        // Now set current n as prev ( A )
            n       = next;     // Now Set the next node to work on ( B )
        }

        return this;
    }
    // #endregion


    // #region ITERATORS
    [Symbol.iterator](){
        const result : { value: T | null, done: boolean } = { value: null, done:false };
        let n = this.head;

        return { next:()=>{
            if( !n ) result.done = true;
            else{
                result.value = n.value;
                n            = n.next;
            }
            return result;
        }};
    }
    // #endregion
}