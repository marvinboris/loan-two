import { useConfig } from '@cfafrica/hooks';
import * as Contacts from 'expo-contacts';
import { FormikErrors } from 'formik';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ChevronDownIcon,
  UserCircleIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import { Card } from '../card';
import { SearchBar } from '../search-bar';
import { Typography } from '../typography';
import { useInputStyles } from '../use-input-styles';

export interface Contact {
  name: string;
  mobile: string;
}

export type ContactInputProps = {
  required?: boolean;
  error?: FormikErrors<Contact> | string;
  id: string;
  name: string;
  value?: Contact;
  onChange: (value: Contact) => void;
  label?: string;
  placeholder?: string;
};

export function ContactInput({
  error,
  label,
  onChange,
  placeholder,
  value,
}: ContactInputProps) {
  const styles = useStyles();
  const { theme } = useConfig();

  const [selectedContact, setSelectedContact] = React.useState(value);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = React.useState<Contact[]>([]);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(
    null
  );

  // Demander les permissions au montage du composant
  React.useEffect(() => {
    requestContactsPermission();
  }, []);

  const requestContactsPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          "Cette application a besoin d'accéder à vos contacts pour fonctionner correctement."
        );
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      setHasPermission(false);
    }
  };

  // Charger les contacts
  const loadContacts = async () => {
    if (!hasPermission) {
      await requestContactsPermission();
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        sort: Contacts.SortTypes.FirstName,
      });

      const formattedContacts: Contact[] = data
        .filter(
          (contact) =>
            contact.name &&
            contact.phoneNumbers &&
            contact.phoneNumbers.length > 0
        )
        .map((contact) => ({
          id: contact.id || Math.random().toString(),
          name: contact.name || 'Contact sans nom',
          mobile: contact.phoneNumbers?.[0]?.number || '',
        }));

      setContacts(formattedContacts);
      setFilteredContacts(formattedContacts);
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les contacts. Veuillez réessayer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les contacts selon la recherche
  const filterContacts = (query: string | undefined) => {
    if (!query) return;
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const filtered = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query.toLowerCase()) ||
        contact.mobile.includes(query)
    );
    setFilteredContacts(filtered);
  };

  // Sélectionner un contact
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalVisible(false);
    setSearchQuery('');
    setFilteredContacts(contacts);
    onChange(contact);
  };

  // Ouvrir le modal de sélection
  const openContactModal = () => {
    if (!hasPermission) {
      requestContactsPermission();
      return;
    }
    setIsModalVisible(true);
    loadContacts();
  };

  // Rendu d'un contact dans la liste
  const renderContact = ({ item }: { item: Contact }) => (
    <Card
      size="sm"
      title={item.name}
      subtitleText={item.mobile}
      onPress={() => handleContactSelect(item)}
    />
  );

  if (hasPermission === null) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ActivityIndicator size="small" color={theme.primary} />
        <Typography>Vérification des permissions...</Typography>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <Card onPress={requestContactsPermission}>
        <UserCircleIcon size={24} color={theme.error} />
        <Typography color="error">Autoriser l'accès aux contacts</Typography>
      </Card>
    );
  }

  return (
    <View>
      {label ? <Typography style={styles.label}>{label}</Typography> : null}

      <Card
        size="sm"
        onPress={openContactModal}
        bodyStyle={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
      >
        <UserCircleIcon size={24} color={theme.primary} />
        <Typography style={{ flex: 1 }}>
          {selectedContact
            ? `${selectedContact.name} - ${selectedContact.mobile}`
            : placeholder}
        </Typography>
        <ChevronDownIcon size={20} color={theme.primary} />
      </Card>

      {error ? (
        typeof error === 'string' ? (
          <Typography color="error">{error}</Typography>
        ) : (
          Object.values(error || {}).map((text) => (
            <Typography color="error">{text}</Typography>
          ))
        )
      ) : null}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => setIsModalVisible(false)}
              style={styles.cancelButton}
            >
              <Typography style={styles.cancelText}>Annuler</Typography>
            </Pressable>

            <Typography style={styles.modalTitle}>
              Choisir un contact
            </Typography>

            <View style={styles.placeholder} />
          </View>

          <View style={{ gap: 12, padding: 12, flex: 1 }}>
            <SearchBar
              id="search"
              value={searchQuery}
              onChange={filterContacts}
            />

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Typography style={styles.loadingText}>
                  Chargement des contacts...
                </Typography>
              </View>
            ) : (
              <FlatList
                data={filteredContacts}
                contentContainerStyle={{ gap: 8 }}
                renderItem={renderContact}
                keyExtractor={(item, index) => index.toString()}
                style={styles.contactsList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <UserIcon size={48} color={theme.grey0} />
                    <Typography style={styles.emptyText}>
                      {searchQuery
                        ? 'Aucun contact trouvé'
                        : 'Aucun contact disponible'}
                    </Typography>
                  </View>
                }
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function useStyles() {
  const { theme } = useConfig();
  const inputStyles = useInputStyles({ normal: true });

  const styles = StyleSheet.create({
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.grey4,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: theme.grey4,
    },
    permissionDenied: {
      borderColor: theme.error,
    },
    selectedText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: theme.black,
    },
    placeholderText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: theme.grey0,
    },
    permissionText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: theme.error,
    },
    loadingText: {
      marginLeft: 8,
      fontSize: 16,
      color: theme.grey0,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.white,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.grey4,
    },
    cancelButton: {
      paddingVertical: 8,
    },
    cancelText: {
      fontSize: 16,
      color: theme.primary,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.black,
    },
    placeholder: {
      width: 60,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.grey4,
      marginHorizontal: 16,
      marginVertical: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: theme.black,
    },
    contactsList: {
      flex: 1,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.grey4,
    },
    contactInfo: {
      flex: 1,
    },
    contactName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.black,
      marginBottom: 2,
    },
    contactPhone: {
      fontSize: 14,
      color: theme.grey0,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyText: {
      fontSize: 16,
      color: theme.grey0,
      marginTop: 12,
    },
  });

  return { ...inputStyles, ...styles };
}
