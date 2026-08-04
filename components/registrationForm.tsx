'use client';

import { Button } from "@nextui-org/button";

import {
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Radio,
    RadioGroup,
    Spinner,
    useDisclosure
} from "@nextui-org/react";

import {
    CheckboxGroup,
    Checkbox
} from "@nextui-org/react";

import { useSearchParams } from "next/navigation";

import {
    FormEvent,
    useEffect,
    useState
} from "react";

interface RegistrationFormProps {

    handleSubmission: (
        data: any
    ) => Promise<any>;
}

export default function RegistrationForm(
    {
        handleSubmission
    }: RegistrationFormProps
) {

    const searchParams =
        useSearchParams();

    const {
        isOpen,
        onOpen,
        onOpenChange,
        onClose
    } = useDisclosure();

    const {
        isOpen: isErrorOpen,
        onOpen: onErrorOpen,
        onOpenChange: onErrorOpenChange
    } = useDisclosure();

    const {
        isOpen: isConfirmOpen,
        onOpen: onConfirmOpen,
        onOpenChange: onConfirmOpenChange
    } = useDisclosure();

    // STATES

    const [fee, setFee] =
        useState(0);

    const [isTeamSelected, setIsTeamSelected] =
        useState(false);

    const [type, setType] =
        useState("individual");

    const [teamName, setTeamName] =
        useState("");

    const [member1, setMember1] =
        useState("");

    const [member2, setMember2] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [phoneNumber, setPhoneNumber] =
        useState("");

    const [department, setDepartment] =
        useState("");

    const [university, setUniversity] =
        useState("");

    const [criteria, setCriteria] =
        useState<string[]>([]);

    const [isLoading, setIsLoading] =
        useState(false);

    // DEFAULT EVENT FROM URL

    useEffect(() => {

        const selected =
            searchParams.get("selected");

        if (selected) {

            setCriteria([selected]);

            handleCheckboxChange([selected]);
        }

    }, []);

    // FEE CALCULATION

    const handleCheckboxChange = (
        value:
            string[] |
            FormEvent<HTMLDivElement>
    ): void => {

        let fee = 0;

        if (Array.isArray(value)) {

            const totalEvents =
                value.length;

            if (totalEvents === 1) {

                fee = 10;

            }

            else if (totalEvents === 2) {

                fee = 15;

            }

            else if (totalEvents === 3) {

                fee = 20;

            }

            else if (totalEvents > 3) {

                fee =
                    20 +
                    (totalEvents - 3);
            }
        }

        setFee(fee);
    };

    // TEAM / INDIVIDUAL

    const handleRadioboxChange = (
        value:
            string |
            FormEvent<HTMLDivElement>
    ): void => {

        if (
            typeof value === "string"
        ) {

            if (
                value.includes("team")
            ) {

                setIsTeamSelected(true);

            } else {

                setIsTeamSelected(false);
            }
        }
    };

    // FORM VALIDATION

    const handleSubmit = (): void => {

        const filteredCriteria =
            criteria.filter(
                (item) =>
                    item !== undefined &&
                    item !== null
            );

        // INDIVIDUAL VALIDATION

        if (

            !isTeamSelected && (

                !member1 ||
                !email ||
                !phoneNumber ||
                !department ||
                !university ||
                filteredCriteria.length === 0
            )
        ) {

            setIsLoading(false);

            onOpen();

            return;
        }

        // TEAM VALIDATION

        if (

            isTeamSelected && (

                !teamName ||
                !member1 ||
                !member2 ||
                !email ||
                !phoneNumber ||
                !department ||
                !university ||
                filteredCriteria.length === 0
            )
        ) {

            setIsLoading(false);

            onOpen();

            return;
        }

        onConfirmOpen();
    };

    // FINAL SUBMISSION

    const onConfirm = () => {

        const filteredCriteria =
            criteria.filter(
                (item) =>
                    item !== undefined &&
                    item !== null
            );

        setIsLoading(true);

        onOpen();

        const response =
            handleSubmission({

                isTeamSelected,

                teamName,

                member1,

                member2,

                email,

                phoneNumber,

                department,

                university,

                criteria:
                    filteredCriteria,

                fee

            });

        response.then((res) => {

            console.log(
                "PAYMENT RESPONSE:",
                res
            );

            // FAILED

            if (

                res.status !== 200 ||

                !res.url

            ) {

                console.log(
                    "PAYMENT FAILED:",
                    res
                );

                setIsLoading(false);

                onClose();

                onErrorOpen();

                return;
            }

            // SUCCESS

            window.location.href =
                res.url;
        });
    };

    return (

        <>

            <form
                className="mt-5 flex flex-col gap-5"
                onSubmit={(e) => {

                    e.preventDefault();

                    handleSubmit();
                }}
            >

                {/* TYPE */}

                <RadioGroup
                    isRequired
                    label="Select Your Type:"
                    classNames={{
                        label: "text-left text-bold",
                    }}
                    onValueChange={(value) => {

                        setType(value);

                        handleRadioboxChange(value);

                        if (value === "team") {

                            if (
                                criteria.includes("poster")
                            ) {

                                setCriteria(["poster"]);

                                handleCheckboxChange(
                                    ["poster"]
                                );

                            } else {

                                setCriteria([]);

                                setFee(0);
                            }

                        } else {

                            handleCheckboxChange(criteria);
                        }
                    }}
                    defaultValue="individual"
                >

                    <Radio value="individual">
                        Individual
                    </Radio>

                    <Radio value="team">
                        Team
                    </Radio>

                </RadioGroup>

                {/* TEAM NAME */}

                {
                    type === "team" && (

                        <Input
                            isRequired
                            labelPlacement="outside"
                            label="Team Name:"
                            placeholder="Enter your team name"
                            classNames={{
                                label: "text-lg",
                            }}
                            value={teamName}
                            onChange={(value) =>
                                setTeamName(
                                    value.target.value
                                )
                            }
                        />
                    )
                }

                {/* MEMBER 1 */}

                <Input
                    isRequired
                    labelPlacement="outside"
                    label={
                        type === "team"
                            ? "Member 1:"
                            : "Participant Name:"
                    }
                    placeholder={
                        type === "team"
                            ? "Enter member 1 name"
                            : "Enter your name"
                    }
                    classNames={{
                        label: "text-lg",
                    }}
                    value={member1}
                    onChange={(value) =>
                        setMember1(
                            value.target.value
                        )
                    }
                />

                {/* MEMBER 2 */}

                {
                    type === "team" && (

                        <Input
                            isRequired
                            labelPlacement="outside"
                            label="Member 2:"
                            placeholder="Enter member 2 name"
                            classNames={{
                                label: "text-lg",
                            }}
                            value={member2}
                            onChange={(value) =>
                                setMember2(
                                    value.target.value
                                )
                            }
                        />
                    )
                }

                {/* EMAIL */}

                <Input
                    isRequired
                    labelPlacement="outside"
                    label="Email:"
                    placeholder="Enter your email"
                    classNames={{
                        label: "text-lg",
                    }}
                    value={email}
                    onChange={(value) =>
                        setEmail(
                            value.target.value
                        )
                    }
                />

                {/* PHONE */}

                <Input
                    isRequired
                    labelPlacement="outside"
                    label="Phone Number:"
                    placeholder="Enter your phone number"
                    classNames={{
                        label: "text-lg",
                    }}
                    value={phoneNumber}
                    onChange={(value) =>
                        setPhoneNumber(
                            value.target.value
                        )
                    }
                />

                {/* DEPARTMENT */}

                <Input
                    isRequired
                    labelPlacement="outside"
                    label="Department:"
                    placeholder="Enter your department name"
                    classNames={{
                        label: "text-lg",
                    }}
                    value={department}
                    onChange={(value) =>
                        setDepartment(
                            value.target.value
                        )
                    }
                />

                {/* UNIVERSITY */}

                <Input
                    isRequired
                    labelPlacement="outside"
                    label="University:"
                    placeholder="Enter your university name"
                    classNames={{
                        label: "text-lg",
                    }}
                    value={university}
                    onChange={(value) =>
                        setUniversity(
                            value.target.value
                        )
                    }
                />

                {/* EVENTS */}

                <CheckboxGroup
                    isRequired
                    label="Select Events:"
                    value={criteria}
                    classNames={{
                        label:
                            "text-left text-bold",
                    }}
                    onChange={(value) => {

                        const selected =
                            value as string[];

                        setCriteria(selected);

                        handleCheckboxChange(
                            selected
                        );
                    }}
                >

                    {
                        type === "individual" && (

                            <>
                                <Checkbox value="cad">
                                    CAD Expert
                                </Checkbox>

                                <Checkbox value="mechamind">
                                    Mechamind
                                </Checkbox>

                                <Checkbox value="truss">
                                    Truss Combat
                                </Checkbox>

                                <Checkbox value="management">
                                    Management Maestro
                                </Checkbox>

                                <Checkbox value="poster">
                                    Poster Presentation
                                </Checkbox>
                            </>
                        )
                    }

                    {
                        type === "team" && (

                            <Checkbox value="poster">
                                Poster Presentation
                            </Checkbox>
                        )
                    }

                </CheckboxGroup>

                {/* FEE */}

                <h2 className="text-lg text-left font-bold">

                    Total Fee: {fee} TK

                </h2>

                {/* SUBMIT */}

                <Button
                    onClick={handleSubmit}
                    color="primary"
                >

                    Next

                </Button>

            </form>

            {/* LOADING / VALIDATION MODAL */}

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                isDismissable={false}
                isKeyboardDismissDisabled={true}
            >

                <ModalContent>

                    {(onClose) => (

                        <>

                            {
                                isLoading ||

                                <ModalHeader>

                                    Registration Failed!

                                </ModalHeader>
                            }

                            <ModalBody
                                className={`w-full h-full justify-center ${
                                    isLoading
                                        ? "py-10"
                                        : ""
                                }`}
                            >

                                {
                                    isLoading

                                        ? (

                                            <Spinner
                                                size="lg"
                                                label="Redirecting to payment page..."
                                            />
                                        )

                                        : (

                                            "Please fill up all the fields."
                                        )
                                }

                            </ModalBody>

                            <ModalFooter>

                                {
                                    isLoading ||

                                    <Button
                                        color="danger"
                                        variant="light"
                                        onPress={onClose}
                                    >

                                        Close

                                    </Button>
                                }

                            </ModalFooter>

                        </>
                    )}

                </ModalContent>

            </Modal>

            {/* ERROR MODAL */}

            <Modal
                isOpen={isErrorOpen}
                onOpenChange={onErrorOpenChange}
                isDismissable={false}
                isKeyboardDismissDisabled={true}
            >

                <ModalContent>

                    {(onErrorClose) => (

                        <>

                            <ModalHeader>

                                Unknown Error!

                            </ModalHeader>

                            <ModalBody>

                                Please try again later.

                            </ModalBody>

                            <ModalFooter>

                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onErrorClose}
                                >

                                    Close

                                </Button>

                            </ModalFooter>

                        </>
                    )}

                </ModalContent>

            </Modal>

            {/* CONFIRM MODAL */}

            <Modal
                isOpen={isConfirmOpen}
                onOpenChange={onConfirmOpenChange}
                isDismissable={false}
                isKeyboardDismissDisabled={true}
            >

                <ModalContent>

                    {(onConfirmClose) => (

                        <>

                            <ModalHeader>

                                Confirm Registration

                            </ModalHeader>

                            <ModalBody>

                                Please verify all information before proceeding to payment.

                            </ModalBody>

                            <ModalFooter>

                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onConfirmClose}
                                >

                                    Cancel

                                </Button>

                                <Button
                                    color="primary"
                                    onPress={onConfirm}
                                >

                                    Confirm

                                </Button>

                            </ModalFooter>

                        </>
                    )}

                </ModalContent>

            </Modal>

        </>
    );
}