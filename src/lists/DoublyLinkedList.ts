export class Node<T>{
    value : T | null;
    next  : Node<T> | null = null;
    prev  : Node<T> | null = null;
    constructor( v : T ){ this.value = v; }
}

export default class DoublyLinkedList<T>{
    // #region MAIN
    head  : Node<T> | null = null; // Starting Node
    tail  : Node<T> | null = null; // Last node before repeating
    count                  = 0;    // How Many nodes added to list
    // #endregion

    // #region ADDING
    /** Add item to the end of the list */
    push( v: T ): Node<T> {
        const n = new Node( v );

        if( !this.head ){
            this.head       = n;
            this.tail       = n;
        }else if( this.tail !== null ){
            n.prev          = this.tail;    // Save ref to current tail
            this.tail.next  = n;            // Old tail points to new tail
            this.tail       = n;            // Replace Tail with new node
        }

        this.count++;
        return n;
    }

    /** Add an items to the beginning of the list  */
    unshift( v: T ): Node<T> {
        const n = new Node( v );

        if( !this.head ){
            this.head = n;
            this.tail = n;
        }else{
            this.head.prev  = n;            // Old Head's prev is new Node
            n.next          = this.head;    // New nodes next is old Head
            this.head       = n;            // Node is new Head
        }

        this.count++;
        return n;
    }

    /** Add Item between 2 items */
    insert( idx: number, v: T ): Node<T> | null{
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( idx == 0 ) return this.unshift( v );
        if( idx == this.count ) return this.push( v );

        const p = this.getNodeAt( idx-1 );
        if( !p ) return null;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const n = new Node( v );
        n.next  = p.next; // New node next points to previous's next
        n.prev  = p;      // New Node points to previous
        p.next  = n;      // Prev points to new Node
        
        if( n.next ) n.next.prev = n; // Original Index node prev points to new Node

        this.count++;
        return n;
    }
    // #endregion


    // #region REMOVING
    /** Remove an Item from the End of the List */
    pop(): T | null{
        if( !this.tail || !this.head  ) return null;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const n = this.tail;

        if( this.count == 1 ){
            this.head       = null;
            this.tail       = null;
            this.count      = 0;
        }else{
            this.tail.next  = null;
            this.tail       = n.prev;
            n.prev          = null;
            this.count--;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return n.value;
    }

    /** Remove an item from the beginning of the list */
    shift(): T | null{
        if( !this.head ) return null;

        const n = this.head;

        if( this.count == 1 ){
            this.head   = null;
            this.tail   = null;
            this.count  = 0;
        }else{
            this.head.prev = null;
            this.head      = n.next;
            this.count--;
        }

        n.next = null;
        return n.value;
    }

    // Remove item at index.
    remove( idx: number ): T | null{
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( idx == 0 )            return this.shift();
        if( idx == this.count-1 ) return this.pop();

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const p = this.getNodeAt( idx-1 );
        if( !p ) return null;

        const n = p.next;
        if( n ){
            if( n.next ) n.next.prev = p; // Next Child's prev is Parent
            p.next      = n.next;         // Parent's next is child's next
            n.prev      = null;           // Clean up
            n.next      = null;
            return n.value;
        }

        return null;
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
        let n       = this.head;
        this.head   = this.tail;
        this.tail   = n;

        while( n ){
            next   = n.next;    // Swop Next & Prev
            n.next = n.prev;
            n.prev = next;  
            n      = next;      // Use saved next as the new node
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