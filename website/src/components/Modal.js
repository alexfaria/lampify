import Close from './icons/Close';

export default function Modal({open, toggleModal, content}) {
    return <>
        <div
            className={`${open ? 'visible' : 'invisible'} overflow-y-auto overflow-x-hidden
                       fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full`}>
            <div className="relative p-4 w-fit mx-auto h-full md:h-auto">
                <div className="relative bg-background-light rounded-lg drop-shadow-lg">
                    <div className="flex justify-between items-start p-4 rounded-t">
                        <button type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900
                                           rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                                onClick={toggleModal}>
                            <Close/>
                        </button>
                    </div>
                    <div className="px-6">
                        {content()}
                    </div>
                </div>
            </div>
        </div>
    </>;
}
