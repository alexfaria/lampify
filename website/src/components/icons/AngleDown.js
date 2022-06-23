export default function AngleDown({fill, className}) {
    return (
        <svg
            className={className}
            fill={fill ?? 'currentColor'}
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"/>
        </svg>
    );

    // return (
    //     <svg xmlns="http://www.w3.org/2000/svg"
    //          className={classes}
    //          fill={fill ?? 'currentColor'}
    //          viewBox="0 0 384 512">
    //         <path
    //             d="M192 384c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L192 306.8l137.4-137.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-160 160C208.4 380.9 200.2 384 192 384z"/>
    //     </svg>
    // );
}
