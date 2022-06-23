import Close from './icons/Close';

export default function Modal({open, toggleModal, content}) {
    return <>
        <div
            className={`${open ? 'visible' : 'invisible'} overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full`}>
            <div className="relative p-4 w-full max-w-2xl h-full md:h-auto">
                <div className="relative bg-background-light rounded-lg shadow dark:bg-gray-700">
                    <div className="flex justify-between items-start p-4 rounded-t">
                        <button type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900
                                           rounded-lg text-sm p-1.5 ml-auto inline-flex items-center
                                           dark:hover:bg-gray-600 dark:hover:text-white"
                                onClick={toggleModal}>
                            <Close/>
                        </button>
                    </div>
                    {content()}
                </div>
            </div>
        </div>
    </>;
}
