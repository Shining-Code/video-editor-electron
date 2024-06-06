import React, { useState } from "react";
import { IonIcon } from "@ionic/react";
import {
    homeOutline,
    settingsOutline,
    mailOutline,
    keyOutline,
    cameraOutline,
    gameControllerOutline,
    personOutline,
    videocamOutline,
    menuOutline
} from "ionicons/icons";

function MenuIcon() {
    const [active, setActive] = useState(false);

    const toggleMenu = () => {
        setActive(!active);
    };

    return (
        <div className="app">
            <ul className={`menu ${active ? "active" : ""}`}>
                <div className="menuToggle" onClick={toggleMenu}>
                    <IonIcon icon={menuOutline} style={{ color: "#000" }} />
                </div>
                <li style={{ "--i": 0, "--clr": "#ff2972" }}>
                    <a href="#">
                        <IonIcon icon={homeOutline} />
                    </a>
                </li>
                <li style={{ "--i": 1, "--clr": "#fee800" }}>
                    <a href="#">
                        <IonIcon icon={settingsOutline} />
                    </a>
                </li>
                <li style={{ "--i": 2, "--clr": "#04fc43" }}>
                    <a href="#">
                        <IonIcon icon={mailOutline} />
                    </a>
                </li>
                <li style={{ "--i": 3, "--clr": "#fe00f1" }}>
                    <a href="#">
                        <IonIcon icon={keyOutline} />
                    </a>
                </li>
                <li style={{ "--i": 4, "--clr": "#00b0fe" }}>
                    <a href="#">
                        <IonIcon icon={cameraOutline} />
                    </a>
                </li>
                <li style={{ "--i": 5, "--clr": "#fea600" }}>
                    <a href="#">
                        <IonIcon icon={gameControllerOutline} />
                    </a>
                </li>
                <li style={{ "--i": 6, "--clr": "#a529ff" }}>
                    <a href="#">
                        <IonIcon icon={personOutline} />
                    </a>
                </li>
                <li style={{ "--i": 7, "--clr": "#01bdab" }}>
                    <a href="#">
                        <IonIcon icon={videocamOutline} />
                    </a>
                </li>
            </ul>
        </div>
    );
}

export default MenuIcon;
