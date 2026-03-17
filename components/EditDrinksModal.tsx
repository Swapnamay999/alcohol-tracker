import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { useDrinkStore } from '../store/useDrinkStore';

interface EditDrinksModalProps {
    visible: boolean;
    onClose: () => void;
}
type PendingAction = { type: 'reset' } | { type: 'save_edits' } | null;

const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*?';
    const length = Math.floor(Math.random() * (12 - 8 + 1)) + 8; // 8 to 12 characters
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};


export default function EditDrinksModal({ visible, onClose }: EditDrinksModalProps) {
    const { drinksLogged, updateDrinkCount, resetDrinks } = useDrinkStore();
    const [captcha, setCaptcha] = useState('');
    const [userInput, setUserInput] = useState('');
    const [showCaptchaPrompt, setShowCaptchaPrompt] = useState(false);
    const [localDrinks, setLocalDrinks] = useState(drinksLogged);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);


    useEffect(() => {
        if (visible) {
            setLocalDrinks(JSON.parse(JSON.stringify(drinksLogged))); // Clone current drinks
            setCaptcha(generateCaptcha());
            setUserInput('');
            setShowCaptchaPrompt(false);
            setPendingAction(null);
        }
    }, [visible, drinksLogged]);

    const initiateCaptcha = (action: PendingAction) => {
        setPendingAction(action);
        setShowCaptchaPrompt(true);
        setCaptcha(generateCaptcha());
        setUserInput('');
    };

    const handleResetRequest = () => initiateCaptcha({ type: 'reset' });

    // Edits only update local UI state now
    const handleIncrement = (time: string, currentCount: number) => {
        setLocalDrinks(prev => prev.map(d => d.time === time ? { ...d, count: currentCount + 1 } : d));
    };

    const handleDecrement = (time: string, currentCount: number) => {
        setLocalDrinks(prev => prev.map(d => d.time === time ? { ...d, count: Math.max(0, currentCount - 1) } : d));
    };

    // Checks for changes when Done is pressed
    const handleDone = () => {
        const hasChanges = JSON.stringify(localDrinks) !== JSON.stringify(drinksLogged);
        if (hasChanges) {
            initiateCaptcha({ type: 'save_edits' });
        } else {
            onClose(); // No changes, just close
        }
    };

    const confirmAction = () => {
        if (userInput === captcha && pendingAction) {
            if (pendingAction.type === 'reset') {
                resetDrinks();
                onClose();
            } else if (pendingAction.type === 'save_edits') {
                // Save all modified local drinks to the global store/SQLite
                localDrinks.forEach(localDrink => {
                    const originalDrink = drinksLogged.find(d => d.time === localDrink.time);
                    if (!originalDrink || originalDrink.count !== localDrink.count) {
                        updateDrinkCount(localDrink.time, localDrink.count);
                    }
                });
                setShowCaptchaPrompt(false);
                setPendingAction(null);
                onClose();
            }
        } else {
            Alert.alert("Verification Failed", "The text did not match. Please try again.");
            setCaptcha(generateCaptcha());
            setUserInput('');
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.header}>Edit Session Logs</Text>

                    {!showCaptchaPrompt ? (
                        <>
                            <ScrollView style={styles.listContainer}>
                                {localDrinks.length === 0 ? (
                                    <Text style={styles.emptyText}>No drinks logged yet.</Text>
                                ) : (
                                    localDrinks.map((drink, index) => (
                                        <View key={`${drink.time}-${index}`} style={styles.drinkRow}>
                                            <View style={styles.drinkInfo}>
                                                <Text style={styles.drinkName}>{drink.type}</Text>
                                                <Text style={styles.drinkDetails}>
                                                    {drink.sizeMl}ml • {drink.abv}% ABV
                                                </Text>
                                            </View>

                                            <View style={styles.controls}>
                                                <Pressable onPress={() => handleDecrement(drink.time, drink.count)} style={styles.circleBtn}>
                                                    <Text style={styles.btnText}>-</Text>
                                                </Pressable>
                                                <Text style={styles.countText}>{drink.count}</Text>
                                                <Pressable onPress={() => handleIncrement(drink.time, drink.count)} style={styles.circleBtn}>
                                                    <Text style={styles.btnText}>+</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </ScrollView>

                            <View style={styles.actionRow}>
                                <Pressable style={styles.closeBtn} onPress={handleDone}>
                                    <Text style={styles.closeBtnText}>Done</Text>
                                </Pressable>

                                <Pressable
                                    style={[styles.resetBtn, drinksLogged.length === 0 && styles.disabledBtn]}
                                    onPress={handleResetRequest}
                                    disabled={drinksLogged.length === 0}
                                >
                                    <Text style={styles.resetBtnText}>Reset All</Text>
                                </Pressable>
                            </View>
                        </>
                    ) : (
                        <View style={styles.captchaContainer}>
                            <Text style={styles.warningText}>{pendingAction?.type === 'reset' ? '⚠️ Destructive Action' : '⚠️ Confirm Edit'}</Text>
                            <Text style={styles.bodyText}>
                                To prevent accidental resets, please type the following characters exactly as shown (case-sensitive):
                            </Text>

                            <View style={styles.captchaBox}>
                                <Text style={styles.captchaString}>{captcha}</Text>
                            </View>

                            <TextInput
                                style={styles.input}
                                value={userInput}
                                onChangeText={setUserInput}
                                placeholder="Type confirmation here..."
                                placeholderTextColor="#555"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <View style={styles.actionRow}>
                                <Pressable style={styles.cancelBtn} onPress={() => {
                                    setShowCaptchaPrompt(false);
                                    setPendingAction(null);
                                }}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </Pressable>

                                <Pressable style={styles.confirmBtn} onPress={confirmAction}>
                                    <Text style={styles.confirmBtnText}>
                                        {pendingAction?.type === 'reset' ? 'Confirm Reset' : 'Confirm Edit'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    )}

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#121212',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: '#333',
    },
    header: {
        color: '#00FF00',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    listContainer: {
        maxHeight: 300,
        marginBottom: 20,
    },
    emptyText: {
        color: '#A0A0A0',
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 20,
    },
    drinkRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#00FF00',
    },
    drinkInfo: {
        flex: 1,
    },
    drinkName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    drinkDetails: {
        color: '#A0A0A0',
        fontSize: 12,
        marginTop: 4,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    circleBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: '#00FF00',
        fontSize: 18,
        fontWeight: 'bold',
    },
    countText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        width: 24,
        textAlign: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    closeBtn: {
        flex: 1,
        backgroundColor: '#333',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    resetBtn: {
        flex: 1,
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: '#FF4444',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    resetBtnText: {
        color: '#FF4444',
        fontWeight: 'bold',
        fontSize: 16,
    },
    disabledBtn: {
        opacity: 0.3,
    },
    captchaContainer: {
        alignItems: 'center',
    },
    warningText: {
        color: '#FF4444',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    bodyText: {
        color: '#A0A0A0',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    captchaBox: {
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#00FF00',
        marginBottom: 16,
        width: '100%',
    },
    captchaString: {
        color: '#00FF00',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 4,
        textAlign: 'center',
        fontFamily: 'monospace', // Gives it a more technical look
    },
    input: {
        backgroundColor: '#1E1E1E',
        color: '#FFF',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        width: '100%',
        marginBottom: 20,
        textAlign: 'center',
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#333',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: '#FF4444',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});