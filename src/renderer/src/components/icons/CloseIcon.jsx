import React from 'react';
import Lottie from 'react-lottie';
import animationData from './json/CloseIcon.json'; // replace with your actual path

const CloseIcon = () => {

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
        },
    }
    return (
        <div className="w-10 h-10">
            <Lottie options={defaultOptions} height={100}
                width={100} />
        </div>
    );
};

export default CloseIcon;
