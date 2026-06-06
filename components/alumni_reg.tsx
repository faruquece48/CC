'use client';

import { Button } from "@nextui-org/button";
import { Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup, Spinner, useDisclosure } from "@nextui-org/react";
import { CheckboxGroup, Checkbox } from "@nextui-org/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";



interface RegistrationFormProps {
    handleSubmission: (data: any) => Promise<any>;
}

export default function RegistrationPage({ handleSubmission }: RegistrationFormProps) {
    const router = useRouter();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange, onClose: onErrorClose } = useDisclosure();
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onOpenChange: onConfirmOpenChange, onClose: onConfirmClose } = useDisclosure();

    const [type, setType] = useState("");
    const [teamName, setTeamName] = useState("");

    const [name, setName] = useState("");
    const [roll, setRoll] = useState("");
    const [employmentType, setEmploymentType] = useState("");
    // employeed
    const [affiliation, setAffiliation] = useState("");
    const [company, setCompany] = useState("");
    //student
    const [programeName, setProgramName] = useState("");
    const [university, setUniversity] = useState("");
    const [country, setCountry] = useState("");

    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);


    const handleTypeChange = (value: string): void => {
        setType(value);
    };

    const handleNameChange = (value: string): void => {
        setName(value);
    };

    const handleRollChange = (value: string): void => {
        setRoll(value);
    };

    const handleEmailChange = (value: string): void => {
        setEmail(value);
    };

    const handlePhoneNumberChange = (value: string): void => {
        setPhoneNumber(value);
    };

    const handleEmploymentTypeChange = (value: string): void => {
        setEmploymentType(value);
    };

    const handleAffilicationChange = (value: string): void => {
        setAffiliation(value);
    }

    const handleCompanyChange = (value: string): void => {
        setCompany(value);
    };

    const handleProgramNameChange = (value: string): void => {
        setProgramName(value);
    }

    const handleUniversityChange = (value: string): void => {
        setUniversity(value);
    };


    const handleCountryChange = (value: string): void => {
        setCountry(value);
    };

    const handleSubmit = (): void => {

        console.log(name, roll, phoneNumber, email, type)

        // Check if all the required fields are filled
        if ((!name || !roll || !phoneNumber || !email || !type)) {
            onOpen();
            return;
        }

        if (type === 'employed' && (!employmentType || !affiliation || !company)) {
            setIsLoading(false);
            onOpen();
            return;
        }

        if (type == 'student' && (!programeName || !university || !country)) {
            setIsLoading(false);
            onOpen();
            return;
        }
        onConfirmOpen();
    }

    const onConfirm = () => {

        setIsLoading(true);
        onOpen();
        const response = handleSubmission({ name, roll, phoneNumber, email, type, affiliation, company, programeName, university, country, fee: 500 });

        response.then((res) => {
            if (res.status === 500) {
                setIsLoading(false)
                onClose();
                onErrorOpen();
            }
            router.push(res.url);
            console.log(res);
        });
    }

    return (
        <>
            <h1 className="text-3xl font-bold">Alumni Registration</h1>
            <form className="w-full mt-5 flex flex-col gap-5">
                <Input
                    isRequired
                    labelPlacement="outside"
                    label="Name:"
                    placeholder="Enter your name"
                    classNames={{
                        label: "text-lg ",
                    }}
                    value={name}
                    onValueChange={(value) => handleNameChange(value)}
                />
                <Input
                    isRequired
                    labelPlacement="outside"
                    label="Roll No:"
                    placeholder="Enter your roll"
                    classNames={{
                        label: "text-lg ",
                    }}
                    value={roll}
                    onValueChange={(value) => handleRollChange(value)}
                />
                <Input
                    isRequired
                    labelPlacement="outside"
                    label="Phone Number:"
                    placeholder="Enter your phone number"
                    classNames={{
                        label: "text-lg ",
                    }}
                    value={phoneNumber}
                    onValueChange={(value) => handlePhoneNumberChange(value)}
                />
                <Input
                    isRequired
                    labelPlacement="outside"
                    label="Email:"
                    placeholder="Enter your email"
                    classNames={{
                        label: "text-lg ",
                    }}
                    value={email}
                    onValueChange={(value) => handleEmailChange(value)}
                />

                <RadioGroup
                    isRequired
                    label="Current Position:"
                    classNames={{
                        label: "text-left text-bold ",
                    }}
                    onValueChange={(value) => {
                        handleTypeChange(value);
                    }}
                    defaultChecked={true}
                >
                    <Radio value="employed">Employed</Radio>
                    <Radio value="unemployed">Unemployed</Radio>
                    <Radio value="student">Student</Radio>
                </RadioGroup>

                {type === "employed" && (
                    <>
                        <RadioGroup
                            isRequired
                            label="Type of Employment:"
                            classNames={{
                                label: "text-left text-bold ",
                            }}
                            onValueChange={(value) => {
                                handleEmploymentTypeChange(value);
                            }}
                            defaultChecked={true}
                            defaultValue="Employed"
                        >
                            <Radio value="govt">Govt. service</Radio>
                            <Radio value="autonomous">Autonomous</Radio>
                            <Radio value="private">Private Service</Radio>
                        </RadioGroup>
                        <Input
                            className="mb-10 md:mb-0"
                            isRequired
                            labelPlacement="outside"
                            label="Affiliation:"
                            placeholder="Enter your affiliation"
                            classNames={{
                                label: "text-lg ",
                            }}
                            value={affiliation}
                            onValueChange={(value) => (handleAffilicationChange(value))}
                        />
                        <Input
                            isRequired
                            labelPlacement="outside"
                            label="Name of organization/Institute/Department/Company:"
                            placeholder="Enter your details"
                            classNames={{
                                label: "inline-block w-full text-wrap text-lg",
                            }}
                            value={company}
                            onValueChange={(value) => handleCompanyChange(value)}
                        />
                    </>
                )}
                {type === "student" && (
                    <>
                        <RadioGroup
                            isRequired
                            label="Program Name:"
                            classNames={{
                                label: "text-left text-bold ",
                            }}
                            onValueChange={(value) => {
                                handleProgramNameChange(value)
                            }}
                            defaultChecked={true}
                            defaultValue="Employed"
                        >
                            <Radio value="msc">M.Sc</Radio>
                            <Radio value="phd">Phd</Radio>
                        </RadioGroup>
                        <Input
                            isRequired
                            labelPlacement="outside"
                            label="University/Institute Name:"
                            placeholder="Enter your university name"
                            classNames={{
                                label: "text-lg ",
                            }}
                            value={university}
                            onValueChange={(value) => handleUniversityChange(value)}
                        />
                        <Input
                            isRequired
                            labelPlacement="outside"
                            label="Country:"
                            placeholder="Enter your country"
                            classNames={{
                                label: "text-lg ",
                            }}
                            value={country}
                            onValueChange={(value) => handleCountryChange(value)}
                        />
                    </>

                )}
                <Button
                    onClick={handleSubmit}
                >
                    Next
                </Button>
            </form>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            {isLoading || <ModalHeader className="flex flex-col gap-1">Registration Failed!</ModalHeader>}
                            <ModalBody className={`w-full h-full justify-center ${isLoading ? 'py-10' : ''}`}>
                                {isLoading ? <Spinner size="lg" label="Redirecting to payment page..." /> : "Please fill up all the fields..."}
                            </ModalBody>
                            <ModalFooter>
                                {
                                    isLoading ||
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        Close
                                    </Button>
                                }
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Modal isOpen={isErrorOpen} onOpenChange={onErrorOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
                <ModalContent>
                    {(onErrorClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Unknown Error!</ModalHeader>
                            <ModalBody className="w-full h-full justify-center">
                                Please try again with different values.
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onErrorClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={isConfirmOpen} onOpenChange={onConfirmOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
                <ModalContent>
                    {(onConfirmClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Do you confirm?</ModalHeader>
                            <ModalBody className="w-full h-full justify-center">
                                You are about to pay 500 BDT for the registration. Do you confirm?
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onConfirmClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={onConfirm}>
                                    Confirm
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
