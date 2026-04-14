import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button, Modal, Card, Flex } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import Header from './header';
import './Home.css';

const { Meta } = Card;

function Home() {


    useEffect(() => {
        const initializeGoogleClient = () => {
            if (window.google) {
                window.tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: '683904201212-8vfplc01p87ep4p4og0vgrofjfedivle.apps.googleusercontent.com',
                    scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email',
                    callback: async (tokenResponse) => {
                        if (tokenResponse && tokenResponse.access_token) {
                            const accessToken = tokenResponse.access_token;

                            try {
                                const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                    headers: { Authorization: `Bearer ${accessToken}` }
                                });
                                const userInfo = await response.json();

                                const email = userInfo.email;

                                localStorage.setItem('google_access_token', accessToken);
                                localStorage.setItem('user_email', email);

                                console.log("Success! Email stored:", email);
                                setIsDisabled(false);

                            } catch (error) {
                                console.error("Error fetching user email:", error);
                            }
                        }
                    },
                });
            }
        };

        if (window.google) {
            initializeGoogleClient();
        } else {
            const timer = setInterval(() => {
                if (window.google) {
                    initializeGoogleClient();
                    clearInterval(timer);
                }
            }, 500);
        }
    },);

    const handleGoogleSignIn = () => {
        if (window.tokenClient) {
            window.tokenClient.requestAccessToken();
        } else {
            console.error("Google Client not initialized yet.");
        }
    }



    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setOpen(false);
        }, 3000);
    };





    const [isDisabled, setIsDisabled] = useState(true);


    return (

        <>
            <Header />
            <span className='MainText'>Weave <span className='Culture'>Culture</span> Into<br /><span className='Life'>Your Daily Life</span ></span>
            <Button className="homebutton" shape="round" type='primary' onClick={showModal} icon={<ArrowRightOutlined />} size='medium'>
                Schedule an Activity Now
            </Button>
            <Modal
                open={open}
                title={<p className='ModalTitle'>Import Your Calendar</p>}
                onOk={handleOk}
                style={{ top: 60 }}
                width={'600px'}
                closable={false}
                footer={[
                    <Button
                        type="primary"
                        disabled={isDisabled}
                        loading={loading}
                        onClick={handleOk}
                        icon={<ArrowRightOutlined />}
                        shape='round'
                        style={{ backgroundColor: "#5fCCA1" }}
                    >
                        <Link to="/activity">Next</Link>
                    </Button>,
                ]}
            >
                <Flex className='Flex' gap='30px'>
                    <Card
                        hoverable
                        onClick={() => {
                            handleGoogleSignIn();
                            setIsDisabled(false);
                        }}
                        style={{ width: 300, alignContent: 'center' }}
                        cover={
                            <img
                                draggable={false}
                                src="/images/GC.svg"
                                style={{
                                    width: '80px',
                                    marginLeft: '80px',
                                    marginTop: '50px',
                                    marginBottom: '20px'
                                }}

                            />
                        }
                    >
                        <Meta title={<p className='x'>Google</p>} />
                    </Card>
                    <Card
                        hoverable
                        onClick={() => {
                            setIsDisabled(false);
                        }}
                        style={{ width: 300, alignContent: 'center' }}
                        cover={
                            <img
                                draggable={false}
                                src="/images/OC.svg"
                                style={{
                                    width: '80px',
                                    marginLeft: '80px',
                                    marginTop: '50px',
                                    marginBottom: '20px'
                                }}

                            />
                        }
                    >
                        <Meta title={<p className='x1'>Outlook</p>} />
                    </Card>
                </Flex>
            </Modal >
        </>
    );
}


export default Home