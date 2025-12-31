// Policy Data Management System - Server-Side API Implementation
// Updated to use server storage instead of localStorage

class PolicyDataManager {
    constructor() {
        console.log('💾 PolicyDataManager constructor called');
        this.apiBase = '';  // Use relative URLs
        console.log('💾 Starting database initialization...');
        this.initializeDatabase();
    }

    // Initialize database with sample data if empty
    async initializeDatabase() {
        try {
            console.log('💾 Checking if policies exist on server...');
            const response = await fetch(`${this.apiBase}/api/policies`);
            console.log('💾 Server response status:', response.status);
            const data = await response.json();
            console.log('💾 Server response data:', data);

            // Handle both response formats: direct array or {success, policies} object
            let policies = [];
            if (Array.isArray(data)) {
                // Direct array response
                policies = data;
                console.log('✅ Found', policies.length, 'existing policies on server (direct array)');
            } else if (data.success && data.policies) {
                // Object with success and policies
                policies = data.policies;
                console.log('✅ Found', policies.length, 'existing policies on server (object format)');
            } else if (data.success && data.policies && data.policies.length === 0) {
                console.log('📋 Initializing policy database with sample data...');
                await this.createSampleData();
            }

            // If we found policies, they're already loaded on the server
            if (policies.length > 0) {
                console.log('💾 Server already has', policies.length, 'policies loaded');
            }
        } catch (error) {
            console.error('❌ Error checking policy database:', error);
            console.error('❌ Error details:', error.stack);
        }
    }

    // Create sample data
    async createSampleData() {
        const samplePolicies = [
            {
                id: 'policy-001',
                policy_number: 'VIG-2024-001',
                type: 'Commercial Auto Insurance',
                status: 'Active',
                premium: 12450,
                effective_date: '2024-01-15',
                expiration_date: '2025-01-15',
                carrier: 'Progressive Commercial',
                insured_name: 'ABC Trucking LLC',
                client_phone: '(555) 123-4567',
                client_email: 'john@abctrucking.com',
                address: '1234 Main St, Columbus, OH 43215',
                vehicles: [
                    {
                        year: 2020,
                        make: 'Freightliner',
                        model: 'Cascadia',
                        vin: '1FUJGBDV5LLBXXXXX',
                        weight: '80,000 lbs',
                        body_type: 'Tractor',
                        use: 'Commercial Transportation',
                        radius: 'Interstate',
                        vehicle_cost: '$125,000',
                        lien_holder: 'Freightliner Financial'
                    }
                ],
                coverage: {
                    auto_liability: {
                        combined_single_limit: '$1,000,000',
                        medical_payments: '$5,000',
                        uninsured_motorist: '$1,000,000',
                        underinsured_motorist: '$1,000,000'
                    },
                    physical_damage: {
                        comprehensive: 'Actual Cash Value',
                        collision: 'Actual Cash Value',
                        comprehensive_deductible: '$1,000',
                        collision_deductible: '$1,000'
                    }
                }
            }
        ];

        try {
            const response = await fetch(`${this.apiBase}/api/policies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ policies: samplePolicies })
            });

            const result = await response.json();
            if (result.success) {
                console.log('✅ Sample policies created successfully');
            } else {
                console.error('❌ Failed to create sample policies:', result.error);
            }
        } catch (error) {
            console.error('❌ Error creating sample data:', error);
        }
    }

    // Get all policies
    async getAllPolicies() {
        try {
            console.log('🔍 getAllPolicies: Making request to', `${this.apiBase}/api/policies`);
            const response = await fetch(`${this.apiBase}/api/policies`);
            console.log('🔍 getAllPolicies: Response status:', response.status);
            const data = await response.json();
            console.log('🔍 getAllPolicies: Response data:', data);

            // Handle response formats - now expecting direct array from normalized server
            console.log('🔍 getAllPolicies: Checking data format...');
            console.log('🔍 getAllPolicies: data is array?', Array.isArray(data));
            console.log('🔍 getAllPolicies: data type:', typeof data);

            if (Array.isArray(data)) {
                // Server now returns normalized policies directly
                console.log('🔍 getAllPolicies: Returning server-normalized array of', data.length, 'policies');

                // Log policy structures for debugging specific policies
                data.forEach(policy => {
                    if (policy.id === 'POL966740' || policy.policyNumber === 'POL966740') {
                        console.log('🚨 CLIENT DEBUG - POL966740 structure from server:', {
                            id: policy.id,
                            policy_number: policy.policy_number,
                            insured_name: policy.insured_name,
                            client_phone: policy.client_phone,
                            client_email: policy.client_email,
                            normalized_at: policy.normalized_at
                        });
                    }
                });

                return data;
            } else if (data && data.success && data.policies) {
                // Legacy format fallback
                console.log('🔍 getAllPolicies: Returning legacy object.policies with', data.policies.length, 'policies');
                return data.policies;
            } else {
                console.warn('🔍 getAllPolicies: Unexpected response format from /api/policies:');
                console.warn('  - data:', data);
                console.warn('  - data.success:', data?.success);
                console.warn('  - data.policies:', data?.policies);
                return [];
            }
        } catch (error) {
            console.error('❌ getAllPolicies: Error fetching policies:', error);
            return [];
        }
    }

    // Get policy by ID
    async getPolicyById(policyId) {
        try {
            const policies = await this.getAllPolicies();
            console.log('🔍 getPolicyById: Looking for policy:', policyId);
            console.log('🔍 getPolicyById: Available policies:', policies.length);

            // Enhanced policy matching - check multiple ID formats and policy number
            const policy = policies.find(p => {
                const matches = p.id === policyId ||
                       p.id === `policy-${policyId}` ||
                       p.policy_number === policyId ||
                       p.policyNumber === policyId ||
                       (p.id && p.id.includes(policyId)) ||
                       (policyId.includes('policy-') && p.policy_number === policyId.replace('policy-', ''));

                if (matches) {
                    console.log('✅ getPolicyById: Found matching policy:', p.id, p.policy_number);
                }
                return matches;
            });

            if (!policy) {
                console.warn('⚠️ getPolicyById: No policy found for ID:', policyId);
            }

            return policy || null;
        } catch (error) {
            console.error('❌ Error fetching policy:', error);
            return null;
        }
    }

    // Get policy by number
    async getPolicyByNumber(policyNumber) {
        try {
            const policies = await this.getAllPolicies();
            return policies.find(p => p.policy_number === policyNumber) || null;
        } catch (error) {
            console.error('❌ Error fetching policy:', error);
            return null;
        }
    }

    // Add new policy
    async addPolicy(policyData) {
        try {
            const response = await fetch(`${this.apiBase}/api/policies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ policies: [policyData] })
            });

            const result = await response.json();
            if (result.success) {
                console.log('✅ Policy added successfully');
                return policyData;
            } else {
                console.error('❌ Failed to add policy:', result.error);
                return null;
            }
        } catch (error) {
            console.error('❌ Error adding policy:', error);
            return null;
        }
    }

    // Update policy
    async updatePolicy(policyId, updates) {
        try {
            console.log('🚨 UPDATEPOLICY DEBUG - Starting update process');
            console.log('🚨 UPDATEPOLICY DEBUG - policyId:', policyId);
            console.log('🚨 UPDATEPOLICY DEBUG - updates object:', updates);
            console.log('🚨 UPDATEPOLICY DEBUG - updates keys:', Object.keys(updates));
            console.log('🚨 UPDATEPOLICY DEBUG - updates phone:', updates.client_phone);
            console.log('🚨 UPDATEPOLICY DEBUG - updates email:', updates.client_email);

            // Use efficient single-policy PUT endpoint instead of sending all policies
            console.log('🚨 UPDATEPOLICY DEBUG - Using efficient PUT endpoint for single policy update');

            const response = await fetch(`${this.apiBase}/api/policies/${policyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });

            console.log('🚨 UPDATEPOLICY DEBUG - Server response status:', response.status);
            console.log('🚨 UPDATEPOLICY DEBUG - Response headers:', [...response.headers.entries()]);

            const result = await response.json();
            console.log('🚨 UPDATEPOLICY DEBUG - Server response data:', result);

            if (result.success) {
                console.log('✅ Policy updated successfully using PUT endpoint');
                // Get the updated policy to return
                const updatedPolicy = await this.getPolicyById(policyId);
                console.log('🚨 UPDATEPOLICY DEBUG - Returning updated policy:', updatedPolicy);
                return updatedPolicy;
            } else {
                console.error('❌ Failed to update policy:', result.error);
                return null;
            }
        } catch (error) {
            console.error('❌ Error updating policy:', error);
            console.error('❌ Error stack:', error.stack);
            return null;
        }
    }

    // Delete policy
    async deletePolicy(policyId) {
        try {
            const response = await fetch(`${this.apiBase}/api/policies/${policyId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                console.log('✅ Policy deleted successfully');
                return true;
            } else {
                console.error('❌ Failed to delete policy:', result.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Error deleting policy:', error);
            return false;
        }
    }

    // Authentication methods (local implementation)
    async authenticateUser(policyNumber, phoneNumber) {
        try {
            console.log('🔐 AUTHENTICATEUSER DEBUG - Starting authentication process');
            console.log('🔐 INPUT - Policy Number:', policyNumber);
            console.log('🔐 INPUT - Phone Number:', phoneNumber);
            console.log('🔐 INPUT - Phone Number (clean):', phoneNumber.replace(/\D/g, ''));

            const policies = await this.getAllPolicies();
            console.log('🔐 POLICIES LOADED - Total count:', policies.length);

            // Log first few policy IDs and phone numbers for debugging
            console.log('🔐 SAMPLE POLICIES:');
            policies.slice(0, 3).forEach((p, i) => {
                console.log(`  ${i+1}. ID: ${p.id}, Policy: ${p.policy_number}, Phone: ${p.client_phone} (clean: ${p.client_phone?.replace(/\D/g, '') || 'N/A'})`);
            });

            // Look for the specific policy
            const targetPolicy = policies.find(p => p.policy_number === policyNumber);
            if (targetPolicy) {
                console.log('🔐 TARGET POLICY FOUND:', {
                    id: targetPolicy.id,
                    policy_number: targetPolicy.policy_number,
                    client_phone: targetPolicy.client_phone,
                    client_phone_clean: targetPolicy.client_phone?.replace(/\D/g, ''),
                    insured_name: targetPolicy.insured_name
                });
            } else {
                console.log('🔐 TARGET POLICY NOT FOUND for policy number:', policyNumber);
                console.log('🔐 Available policy numbers:', policies.map(p => p.policy_number));
            }

            const policy = policies.find(p =>
                p.policy_number === policyNumber &&
                p.client_phone.replace(/\D/g, '') === phoneNumber.replace(/\D/g, '')
            );

            console.log('🔐 AUTHENTICATION RESULT:');
            console.log('  - Policy found:', !!policy);
            console.log('  - Policy match details:', policy ? {
                id: policy.id,
                policy_number: policy.policy_number,
                client_phone: policy.client_phone,
                insured_name: policy.insured_name
            } : 'None');

            if (policy) {
                // Check if policy is active (defaults to true if not specified)
                const isActive = policy.active !== false;
                console.log('🔐 POLICY ACTIVE CHECK:', {
                    active: policy.active,
                    activeType: typeof policy.active,
                    activeValue: policy.active,
                    isActive: isActive,
                    policyObject: policy
                });

                if (!isActive) {
                    console.log('❌ AUTHENTICATION FAILED - Policy is inactive');
                    console.log('❌ BLOCKING LOGIN for policy:', policy.policy_number);
                    return {
                        success: false,
                        error: 'Your policy is currently inactive. Please contact your agent for assistance.',
                        blocked: true
                    };
                }

                console.log('✅ AUTHENTICATION SUCCESS - Policy is active and login allowed');
                return {
                    success: true,
                    user: {
                        name: policy.insured_name,
                        email: policy.client_email,
                        phone: policy.client_phone,
                        policy_number: policy.policy_number
                    },
                    policy: policy,
                    token: 'client_token_' + policy.id
                };
            }

            console.log('❌ AUTHENTICATION FAILED - No matching policy found');
            return {
                success: false,
                error: 'Invalid policy number or phone number'
            };
        } catch (error) {
            console.error('❌ Authentication error:', error);
            console.error('❌ Error stack:', error.stack);
            return {
                success: false,
                error: 'Authentication failed'
            };
        }
    }

    // Get user policies
    async getUserPolicies(policyNumber) {
        try {
            const policies = await this.getAllPolicies();
            console.log('🔍 getUserPolicies: Looking for policy number:', policyNumber);
            console.log('🔍 getUserPolicies: Total policies to search:', policies.length);

            const matchingPolicies = policies.filter(p => {
                const matches = p.policy_number === policyNumber || p.id === policyNumber;
                if (matches) {
                    console.log('✅ getUserPolicies: Found matching policy:', p.policy_number || p.id);
                }
                return matches;
            });

            console.log('🔍 getUserPolicies: Found', matchingPolicies.length, 'matching policies');
            return matchingPolicies;
        } catch (error) {
            console.error('❌ Error fetching user policies:', error);
            return [];
        }
    }

    // Clear database and reinitialize
    async clearAll() {
        try {
            // Get all policies and delete them
            const policies = await this.getAllPolicies();
            for (const policy of policies) {
                await this.deletePolicy(policy.id);
            }
            console.log('🔄 Policy database cleared');
        } catch (error) {
            console.error('❌ Error clearing database:', error);
        }
    }

    // Search functionality
    async searchPolicies(searchTerm) {
        try {
            const policies = await this.getAllPolicies();
            const term = searchTerm.toLowerCase();

            return policies.filter(policy =>
                policy.policy_number.toLowerCase().includes(term) ||
                policy.insured_name.toLowerCase().includes(term) ||
                policy.client_email.toLowerCase().includes(term) ||
                policy.client_phone.includes(term) ||
                policy.carrier.toLowerCase().includes(term) ||
                policy.type.toLowerCase().includes(term)
            );
        } catch (error) {
            console.error('❌ Error searching policies:', error);
            return [];
        }
    }

    // Statistics
    async getStatistics() {
        try {
            const policies = await this.getAllPolicies();

            const totalPolicies = policies.length;
            const activePolicies = policies.filter(p => p.status === 'Active').length;
            const uniqueClients = new Set(policies.map(p => p.insured_name)).size;

            // Calculate expiring soon (next 60 days)
            const today = new Date();
            const expiringSoon = policies.filter(p => {
                const expDate = new Date(p.expiration_date);
                const diffTime = expDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 60 && diffDays >= 0;
            }).length;

            return {
                totalPolicies,
                activePolicies,
                uniqueClients,
                expiringSoon
            };
        } catch (error) {
            console.error('❌ Error getting statistics:', error);
            return {
                totalPolicies: 0,
                activePolicies: 0,
                uniqueClients: 0,
                expiringSoon: 0
            };
        }
    }

    // Refresh display (compatibility method)
    async refreshDisplay() {
        // This method exists for compatibility with existing code
        // The actual display refresh should be handled by the UI components
        console.log('🔄 Policy display refresh requested');
    }
}

// Global instance
try {
    console.log('🚀 Initializing PolicyDataManager...');
    window.policyDB = new PolicyDataManager();
    console.log('✅ Policy Data Manager initialized - Server-side storage ready');
    console.log('💾 PolicyDataManager available at window.policyDB:', !!window.policyDB);
} catch (error) {
    console.error('❌ Failed to initialize PolicyDataManager:', error);
    console.error('❌ Error stack:', error.stack);
}