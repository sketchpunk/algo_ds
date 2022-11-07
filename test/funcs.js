function select( selector, scope ){
    return ( scope || document ).querySelector( selector );
}

function getParameterValue( paramName, url ){
    const regex  = new RegExp( `[?&]${paramName}(=([^&#]*))` );
    const result = regex.exec( url || window.location.href );

    if( !result )   return null;
    if( !result[2]) return '';

    return decodeURIComponent( result[2].replace( /\+/g, ' ' ) );
}

function memorize( fn ){
    const cache = {};
    return ( ...args )=>{
        const key = args.toString();
        if( key in cache ) return cache[ key ];

        const result = fn( ...args );
        cache[ key ] = result;
        return result;
    }
}

// Prevent lots of double clicking to a function that should only happen
// can also just disable a button, then setimeout to enable it instead of debounce.
// Another use is when typing into a field, it will execute correctly when
// the user is done typing or stops for a second.
function debounce( fn, delay ){
    let id;
    return ( ...args )=>{
        if( id ) clearTimeout( id );
        id = setTimeout( ()=>fn( ...args ), delay );
    };
}

// Limit calling a function by some interval
// For example lots of logging, can use this to limit
// output to a min interval
function throttle( fn, delay ){
    let lastTime = 0;
    return ( ...args )=>{
        const now = new Date().getTime();
        if( now - lastTime < delay ) return;
        lastTime = now;
        fn( ...args );
    }
}