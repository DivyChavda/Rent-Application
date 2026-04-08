import React, { useState, useEffect } from 'react';
import { Calculator, Zap, Home, FileText, Receipt, Download, Save } from 'lucide-react';

const API_URL = 'https://rent-application-rcud-backend.vercel.app/api/billing';

// Type definitions
interface ElectricityBill {
  amount: number;
  meterReading: number;
  perUnitCost: number;
}

interface MeterReading {
  current: number;
  previous: number;
  unitsUsed: number;
}

interface FlatCalculation {
  rent: number;
  electricityBill: number;
  motorBill: number;
  total: number;
  billUsed: string;
  unitsUsed: number;
}

interface FlatNames {
  [key: string]: string;
}

interface ElectricityBills {
  [key: string]: ElectricityBill;
}

interface MotorBillApplicability {
  [key: string]: boolean;
}

interface RentPerFlat {
  [key: string]: number;
}

interface MeterReadings {
  [key: string]: MeterReading;
}

interface FinalAmounts {
  [key: string]: FlatCalculation;
}

interface TabInfo {
  id: number;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const RentElectricityCalculator: React.FC = () => {
  // Flat names mapping
  const flatNames: FlatNames = {
    '001': 'Dineshbhai Chavda',
    '002': 'Lilaben',
    '101': 'Anandbhai',
    '102': 'Bhavikbhai',
    '201': 'Rajubhai',
    '202': 'Pradipbhai',
    '301': 'Jaya Kumari'
  };

  // Flat sequence order
  const flatSequence: string[] = ['001', '002', '101', '102', '201', '202', '301'];

  // State for electricity bills
  const [electricityBills, setElectricityBills] = useState<ElectricityBills>({
    '500179503': { amount: 0, meterReading: 0, perUnitCost: 0 },
    '500199956': { amount: 0, meterReading: 0, perUnitCost: 0 },
    '501165142': { amount: 0, meterReading: 0, perUnitCost: 0 }
  });

  // State for motor bill applicability
  const [motorBillApplicability, setMotorBillApplicability] = useState<MotorBillApplicability>({
    '001': false,
    '002': false,
    '101': false,
    '102': false,
    '201': false,
    '202': false,
    '301': false
  });

  // State for rent per flat
  const [rentPerFlat, setRentPerFlat] = useState<RentPerFlat>({
    '001': 0,
    '002': 0,
    '101': 0,
    '102': 0,
    '201': 0,
    '202': 0,
    '301': 0
  });

  // State for meter readings
  const [meterReadings, setMeterReadings] = useState<MeterReadings>({
    '001': { current: 0, previous: 0, unitsUsed: 0 },
    '002': { current: 0, previous: 0, unitsUsed: 0 },
    '101': { current: 0, previous: 0, unitsUsed: 0 },
    '102': { current: 0, previous: 0, unitsUsed: 0 },
    '201': { current: 0, previous: 0, unitsUsed: 0 },
    '202': { current: 0, previous: 0, unitsUsed: 0 },
    '301': { current: 0, previous: 0, unitsUsed: 0 }
  });

  const [motorBill, setMotorBill] = useState<MeterReading>({ current: 0, previous: 0, unitsUsed: 0 });
  const [activeTab, setActiveTab] = useState<number>(1);
  const [billMonth, setBillMonth] = useState<string>('');
  const [billYear, setBillYear] = useState<number>(new Date().getFullYear());
  const [availablePeriods, setAvailablePeriods] = useState<Array<{month: string, year: number}>>([]);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  
  // State to cache current period data while viewing previous periods
  const [currentPeriodCache, setCurrentPeriodCache] = useState<{
    electricityBills: ElectricityBills;
    meterReadings: MeterReadings;
    motorBill: MeterReading;
    rentPerFlat: RentPerFlat;
    motorBillApplicability: MotorBillApplicability;
  } | null>(null);

  // Initialize bill month to previous month and load previous rent data
  useEffect(() => {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[prevMonth.getMonth()];
    const year = prevMonth.getFullYear();
    
    setBillMonth(month);
    setBillYear(year);
    
    // Fetch previous month rent data
    fetchPreviousRentData(year, month);
  }, []);

  // Function to fetch previous month's rent data
  const fetchPreviousRentData = async (year: number, month: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/previous-rent/${year}/${month}`);
      if (response.ok) {
        const data = await response.json();
        
        // Auto-populate rent per flat from previous month
        if (data.rentPerFlat) {
          setRentPerFlat(data.rentPerFlat);
        }
        
        // Auto-populate motor bill applicability from previous month
        if (data.motorBillApplicability) {
          setMotorBillApplicability(data.motorBillApplicability);
        }
        
        // Auto-populate previous meter readings from previous month's current readings
        if (data.meterReadings) {
          const newReadings: MeterReadings = {
            '001': { current: 0, previous: 0, unitsUsed: 0 },
            '002': { current: 0, previous: 0, unitsUsed: 0 },
            '101': { current: 0, previous: 0, unitsUsed: 0 },
            '102': { current: 0, previous: 0, unitsUsed: 0 },
            '201': { current: 0, previous: 0, unitsUsed: 0 },
            '202': { current: 0, previous: 0, unitsUsed: 0 },
            '301': { current: 0, previous: 0, unitsUsed: 0 }
          };
          flatSequence.forEach(flat => {
            if (data.meterReadings[flat]) {
              newReadings[flat].previous = data.meterReadings[flat].current || 0;
            }
          });
          setMeterReadings(newReadings);
        }
        
        // Auto-populate motor bill previous reading
        if (data.motorBill) {
          setMotorBill({
            current: 0,
            previous: data.motorBill.current || 0,
            unitsUsed: 0
          });
        }
        
        console.log(`Loaded data from ${data.previousMonth} ${data.previousYear}`);
      } else {
        console.log('No previous month data found, starting fresh');
      }
    } catch (error) {
      console.error('Error fetching previous rent data:', error);
    }
  };

  // This effect has been removed - units are now calculated in updateMeterReading function

  // Update electricity bill per-unit cost
  const updateElectricityBill = (billNumber: string, field: keyof ElectricityBill, value: string): void => {
    const numValue = parseFloat(value) || 0;
    const newBills = { ...electricityBills };
    newBills[billNumber][field] = numValue;
    
    if (field === 'amount' || field === 'meterReading') {
      const { amount, meterReading } = newBills[billNumber];
      newBills[billNumber].perUnitCost = meterReading > 0 ? (amount / meterReading) : 0;
    }
    
    setElectricityBills(newBills);
  };

  // Update motor bill readings
  const updateMotorBill = (field: keyof MeterReading, value: string): void => {
    const numValue = parseFloat(value) || 0;
    const newMotorBill = { ...motorBill };
    newMotorBill[field] = numValue;
    
    if (field === 'current') {
      newMotorBill.unitsUsed = Math.max(0, numValue - newMotorBill.previous);
    }
    
    setMotorBill(newMotorBill);
  };

  // Update meter readings and calculate units used
  const updateMeterReading = (flat: string, field: keyof MeterReading, value: string): void => {
    const numValue = parseFloat(value) || 0;
    const newReadings = { ...meterReadings };
    newReadings[flat][field] = numValue;
    
    if (field === 'current') {
      newReadings[flat].unitsUsed = Math.max(0, numValue - newReadings[flat].previous);
    }
    
    setMeterReadings(newReadings);
  };

  // Calculate final amounts for each flat
  const calculateFinalAmounts = (): FinalAmounts => {
    const results: FinalAmounts = {};
    
    // Calculate how many flats have motor bill applicability
    const flatsWithMotorBill = flatSequence.filter(flat => motorBillApplicability[flat]);
    const motorBillFlatCount = flatsWithMotorBill.length;
    
    flatSequence.forEach(flat => {
      let electricityBill = 0;
      let motorBillAmount = 0;
      let billUsed = '';
      
      // Determine which electricity bill to use and calculate units
      if (flat === '001' || flat === '002') {
        // Ground floor - bill 500179503
        billUsed = '500179503';
        if (flat === '002') {
          electricityBill = meterReadings[flat].unitsUsed * electricityBills[billUsed].perUnitCost;
        } else {
          // 001 gets remaining units from bill
          const totalBillUnits = electricityBills[billUsed].meterReading;
          const usedBy002 = meterReadings['002'].unitsUsed;
          const remainingUnits = Math.max(0, totalBillUnits - usedBy002);
          electricityBill = remainingUnits * electricityBills[billUsed].perUnitCost;
        }
      } else if (flat === '101' || flat === '102') {
        // First floor - bill 500199956
        billUsed = '500199956';
        if (flat === '101') {
          // For flat 101: Uses its own meter reading units
          electricityBill = (meterReadings[flat].unitsUsed ) * electricityBills[billUsed].perUnitCost;
        } else {
          // 102 gets remaining units from bill
          const totalBillUnits = electricityBills[billUsed].meterReading;
          const usedBy101 = meterReadings['101'].unitsUsed;
          const motorUnits = motorBillApplicability['101'] ? motorBill.unitsUsed : 0;
          const remainingUnits = Math.max(0, totalBillUnits - usedBy101 - motorUnits);
          electricityBill = remainingUnits * electricityBills[billUsed].perUnitCost;
        }
      } else if (flat === '201' || flat === '202' || flat === '301') {
        // Second floor - bill 501165142
        billUsed = '501165142';
        if (flat === '202' || flat === '301') {
          electricityBill = meterReadings[flat].unitsUsed * electricityBills[billUsed].perUnitCost;
        } else {
          // 201 gets remaining units from bill
          const totalBillUnits = electricityBills[billUsed].meterReading;
          const usedBy202 = meterReadings['202'].unitsUsed;
          const usedBy301 = meterReadings['301'].unitsUsed;
          const remainingUnits = Math.max(0, totalBillUnits - usedBy202 - usedBy301);
          electricityBill = remainingUnits * electricityBills[billUsed].perUnitCost;
        }
      }

      // Calculate motor bill amount - divide equally among applicable flats
      if (motorBillApplicability[flat] && motorBillFlatCount > 0) {
        const motorBillNumber = '500199956';
        const totalMotorBillAmount = motorBill.unitsUsed * electricityBills[motorBillNumber].perUnitCost;
        motorBillAmount = totalMotorBillAmount / motorBillFlatCount;
      }
      
      const totalAmount = rentPerFlat[flat] + electricityBill + motorBillAmount;
      
      results[flat] = {
        rent: rentPerFlat[flat],
        electricityBill: electricityBill,
        motorBill: motorBillAmount,
        total: Math.ceil(totalAmount), // Round up and ceil value
        billUsed,
        unitsUsed: flat === '001' ? 
          (electricityBills['500179503'].meterReading - meterReadings['002'].unitsUsed) :
          flat === '102' ? 
          (electricityBills['500199956'].meterReading - meterReadings['101'].unitsUsed - (motorBillApplicability['101'] ? motorBill.unitsUsed : 0)) :
          flat === '201' ?
          (electricityBills['501165142'].meterReading - meterReadings['202'].unitsUsed - meterReadings['301'].unitsUsed) :
          // For flat 101: Uses meter reading units + motor units (if applicable)
          meterReadings[flat].unitsUsed
      };
    });
    
    return results;
  };

  // Reset readings on first day of month
  const resetToNewMonth = (): void => {
    const newReadings = { ...meterReadings };
    flatSequence.forEach(flat => {
      newReadings[flat].previous = newReadings[flat].current;
      newReadings[flat].unitsUsed = 0;
    });
    setMeterReadings(newReadings);
    
    // Reset motor bill too
    setMotorBill(prev => ({
      ...prev,
      previous: prev.current,
      unitsUsed: 0
    }));
  };

  // Fetch available periods from backend
  const fetchAvailablePeriods = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/periods`);
      if (response.ok) {
        const periods = await response.json();
        setAvailablePeriods(periods);
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  // Load data for selected month/year
  const loadBillingData = async (month: string, year: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/${year}/${month}`);
      if (response.ok) {
        const data = await response.json();
        setElectricityBills(data.electricityBills);
        setMotorBillApplicability(data.motorBillApplicability);
        setRentPerFlat(data.rentPerFlat);
        setMeterReadings(data.meterReadings);
        setMotorBill(data.motorBill);
        setIsViewMode(true);
      } else {
        alert('No data found for this period');
        setIsViewMode(false);
      }
    } catch (error) {
      console.error('Error loading billing data:', error);
      alert('Error loading data');
    }
  };

  // Save current billing data
  const saveBillingData = async (): Promise<void> => {
    try {
      const dataToSave = {
        month: billMonth,
        year: billYear,
        electricityBills,
        motorBillApplicability,
        rentPerFlat,
        meterReadings,
        motorBill
      };

      const response = await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        alert('Data saved successfully!');
        fetchAvailablePeriods();
      } else {
        alert('Error saving data');
      }
    } catch (error) {
      console.error('Error saving billing data:', error);
      alert('Error saving data');
    }
  };

  // Load available periods on component mount
  useEffect(() => {
    fetchAvailablePeriods();
  }, []);

  // Handle period selection from dropdown
  const handlePeriodChange = async (value: string): Promise<void> => {
    if (value === 'current') {
      const now = new Date();
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const month = monthNames[prevMonth.getMonth()];
      const year = prevMonth.getFullYear();
      setBillMonth(month);
      setBillYear(year);
      setSelectedPeriod('current');
      
      // First, try to load saved data for current period from database
      try {
        const response = await fetch(`${API_URL}/${year}/${month}`);
        if (response.ok) {
          // Saved data exists - load it for editing
          const data = await response.json();
          setElectricityBills(data.electricityBills);
          setMotorBillApplicability(data.motorBillApplicability);
          setRentPerFlat(data.rentPerFlat);
          setMeterReadings(data.meterReadings);
          setMotorBill(data.motorBill);
          setIsViewMode(false); // Allow editing saved data
          console.log('Loaded saved data for current period');
        } else {
          // No saved data - check cache or initialize fresh
          if (currentPeriodCache) {
            setElectricityBills(currentPeriodCache.electricityBills);
            setMeterReadings(currentPeriodCache.meterReadings);
            setMotorBill(currentPeriodCache.motorBill);
            setRentPerFlat(currentPeriodCache.rentPerFlat);
            setMotorBillApplicability(currentPeriodCache.motorBillApplicability);
          } else {
            // Initialize fresh with previous month's data
            setElectricityBills({
              '500179503': { amount: 0, meterReading: 0, perUnitCost: 0 },
              '500199956': { amount: 0, meterReading: 0, perUnitCost: 0 },
              '501165142': { amount: 0, meterReading: 0, perUnitCost: 0 }
            });
            setMeterReadings({
              '001': { current: 0, previous: 0, unitsUsed: 0 },
              '002': { current: 0, previous: 0, unitsUsed: 0 },
              '101': { current: 0, previous: 0, unitsUsed: 0 },
              '102': { current: 0, previous: 0, unitsUsed: 0 },
              '201': { current: 0, previous: 0, unitsUsed: 0 },
              '202': { current: 0, previous: 0, unitsUsed: 0 },
              '301': { current: 0, previous: 0, unitsUsed: 0 }
            });
            setMotorBill({ current: 0, previous: 0, unitsUsed: 0 });
            fetchPreviousRentData(year, month);
          }
          setIsViewMode(false);
        }
      } catch (error) {
        console.error('Error checking for saved data:', error);
        setIsViewMode(false);
      }
    } else {
      // Save current period data before switching to view mode
      if (selectedPeriod === 'current' || selectedPeriod === '') {
        setCurrentPeriodCache({
          electricityBills: { ...electricityBills },
          meterReadings: { ...meterReadings },
          motorBill: { ...motorBill },
          rentPerFlat: { ...rentPerFlat },
          motorBillApplicability: { ...motorBillApplicability }
        });
      }
      
      const [year, month] = value.split('-');
      setSelectedPeriod(value);
      setBillMonth(month);
      setBillYear(parseInt(year));
      loadBillingData(month, parseInt(year));
    }
  };

  const finalAmounts = calculateFinalAmounts();

  const tabs: TabInfo[] = [
    { id: 1, name: 'Electricity Bills', icon: Zap },
    { id: 2, name: 'Motor Bill Setup', icon: FileText },
    { id: 3, name: 'Rent Setup', icon: Home },
    { id: 4, name: 'Meter Readings', icon: Calculator },
    { id: 5, name: 'Calculations', icon: Receipt },
    { id: 6, name: 'Results & Receipts', icon: Download }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Calculator className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">Rent & Electricity Calculator</h1>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                {/* Period Filter */}
                <select
                  value={selectedPeriod || 'current'}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="px-3 py-2 sm:px-4 bg-white text-gray-800 rounded-lg border focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                >
                  <option value="current">Current ({billMonth} {billYear})</option>
                  <optgroup label="Previous Periods">
                    {availablePeriods.map(period => (
                      <option key={`${period.year}-${period.month}`} value={`${period.year}-${period.month}`}>
                        {period.month} {period.year}
                      </option>
                    ))}
                  </optgroup>
                </select>
                {/* Save Button */}
                {!isViewMode && (
                  <button
                    onClick={saveBillingData}
                    className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Data</span>
                  </button>
                )}
                {isViewMode && (
                  <div className="bg-yellow-500 text-white px-3 py-2 sm:px-4 rounded-lg text-center text-sm sm:text-base">
                    📖 View Mode
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 text-blue-100 text-xs sm:text-sm">Complete billing solution for multi-flat properties</p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gray-100 border-b overflow-x-auto">
            <nav className="flex space-x-2 sm:space-x-4 md:space-x-8 px-2 sm:px-4 md:px-6 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-4 md:p-6">
            {/* Tab 1: Electricity Bills */}
            {activeTab === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Electricity Bill Entry</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {Object.entries(electricityBills).map(([billNumber, data]) => (
                    <div key={billNumber} className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Bill {billNumber}</h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                          <input
                            type="number"
                            value={data.amount}
                            onChange={(e) => updateElectricityBill(billNumber, 'amount', e.target.value)}
                            disabled={isViewMode}
                            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Total Units</label>
                          <input
                            type="number"
                            value={data.meterReading}
                            onChange={(e) => updateElectricityBill(billNumber, 'meterReading', e.target.value)}
                            disabled={isViewMode}
                            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Per Unit Cost</label>
                          <div className="p-2 sm:p-3 text-sm sm:text-base bg-white border border-gray-300 rounded-md text-gray-600">
                            ₹{data.perUnitCost.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Motor Bill Applicability */}
            {activeTab === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Motor Bill Applicability</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {flatSequence.map(flat => (
                    <div key={flat} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <div className="flex flex-col space-y-2">
                        <span className="font-medium text-sm sm:text-base">{flat} - {flatNames[flat]}</span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Motor Bill Applicable</span>
                          <button
                            onClick={() => setMotorBillApplicability(prev => ({ ...prev, [flat]: !prev[flat] }))}
                            disabled={isViewMode}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              motorBillApplicability[flat] ? 'bg-blue-600' : 'bg-gray-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                motorBillApplicability[flat] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Rent Per Flat */}
            {activeTab === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Rent Setup</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {flatSequence.map(flat => (
                    <div key={flat} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        {flat} - {flatNames[flat]}
                      </label>
                      <input
                        type="number"
                        value={rentPerFlat[flat]}
                        onChange={(e) => setRentPerFlat(prev => ({ ...prev, [flat]: parseFloat(e.target.value) || 0 }))}
                        disabled={isViewMode}
                        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Enter rent amount"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Meter Readings */}
            {activeTab === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Meter Readings</h2>
                  {!isViewMode && (
                    <button
                      onClick={resetToNewMonth}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Reset to New Month
                    </button>
                  )}
                </div>

                {/* Month and Year Selection */}
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold mb-3">Billing Period Settings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Billing Month</label>
                      <select
                        value={billMonth}
                        onChange={(e) => setBillMonth(e.target.value)}
                        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Billing Year</label>
                      <input
                        type="number"
                        value={billYear}
                        onChange={(e) => setBillYear(parseInt(e.target.value) || new Date().getFullYear())}
                        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold mb-3">Water Motor Bill</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Previous Reading</label>
                      <input
                        type="number"
                        value={motorBill.previous}
                        onChange={(e) => updateMotorBill('previous', e.target.value)}
                        disabled={isViewMode}
                        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Last month's motor reading"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Current Reading</label>
                      <input
                        type="number"
                        value={motorBill.current}
                        onChange={(e) => updateMotorBill('current', e.target.value)}
                        disabled={isViewMode}
                        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="This month's motor reading"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Motor Units Used</label>
                      <div className="p-2 sm:p-3 text-sm sm:text-base bg-white border border-gray-300 rounded-md text-gray-600 font-medium">
                        {motorBill.unitsUsed.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {flatSequence.map(flat => (
                    <div key={flat} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="text-base sm:text-lg font-semibold mb-3">{flat} - {flatNames[flat]}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Previous Reading</label>
                          <input
                            type="number"
                            value={meterReadings[flat].previous}
                            onChange={(e) => updateMeterReading(flat, 'previous', e.target.value)}
                            disabled={isViewMode}
                            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Last month"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Current Reading</label>
                          <input
                            type="number"
                            value={meterReadings[flat].current}
                            onChange={(e) => updateMeterReading(flat, 'current', e.target.value)}
                            disabled={isViewMode}
                            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="This month"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Units Used</label>
                          <div className="p-2 sm:p-3 text-sm sm:text-base bg-white border border-gray-300 rounded-md text-gray-600 font-medium">
                            {meterReadings[flat].unitsUsed.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Motor Bill</label>
                          <div className={`p-2 sm:p-3 text-sm sm:text-base bg-white border border-gray-300 rounded-md font-medium ${motorBillApplicability[flat] ? 'text-green-600' : 'text-gray-600'}`}>
                            {motorBillApplicability[flat] ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Calculations */}
            {activeTab === 5 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Bill Calculations</h2>
                <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Flat</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill Used</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Electricity</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Motor</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Rent</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {flatSequence.map(flat => (
                        <tr key={flat}>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{flat}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{flatNames[flat]}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{finalAmounts[flat].billUsed}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{finalAmounts[flat].unitsUsed.toFixed(2)}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">₹{electricityBills[finalAmounts[flat].billUsed].perUnitCost.toFixed(4)}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">₹{finalAmounts[flat].electricityBill.toFixed(2)}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">₹{finalAmounts[flat].motorBill.toFixed(2)}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">₹{finalAmounts[flat].rent.toFixed(2)}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">₹{finalAmounts[flat].total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 6: Results & Receipts */}
            {activeTab === 6 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Results & Receipts - {billMonth} {billYear}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {flatSequence.map(flat => (
                    <div key={flat} className="bg-white border-2 border-gray-800 rounded-lg p-0 shadow-sm">
                      <div className="p-4 sm:p-6">
                        {/* Header matching your format */}
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                          <h3 className="text-lg sm:text-xl font-bold">RENT RECEIPT</h3>
                          <div className="text-xs sm:text-sm">Date: ____________</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          {/* Left side - Rent Details */}
                          <div>
                            <h4 className="font-bold mb-2">Rent Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex">
                                <span className="font-medium w-20">Received From:</span>
                                <span>{flatNames[flat]}</span>
                              </div>
                              <div className="flex">
                                <span className="font-medium w-20">Amount:</span>
                                <span>{finalAmounts[flat].total}/-</span>
                              </div>
                              <div className="flex">
                                <span className="font-medium w-20">Rent For:</span>
                                <span>{billMonth} Month</span>
                              </div>
                              <div className="flex">
                                <span className="font-medium w-20">Rent Period:</span>
                                <span className="text-xs">From 01/{String(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(billMonth) + 1).padStart(2, '0')}/{billYear} To {new Date(billYear, ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(billMonth) + 1, 0).getDate()}/{String(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(billMonth) + 1).padStart(2, '0')}/{billYear}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right side - Paid By */}
                          <div>
                            <h4 className="font-bold mb-2">Paid By</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center">
                                <input type="checkbox" className="mr-2" />
                                <span>Online (GPay, PhonePe, etc.)</span>
                              </div>
                              <div className="flex items-center">
                                <input type="checkbox" className="mr-2" />
                                <span>Check (No. _______)</span>
                              </div>
                              <div className="flex items-center">
                                <input type="checkbox" className="mr-2" />
                                <span>Cash</span>
                              </div>
                              <div className="flex items-center">
                                <input type="checkbox" className="mr-2" />
                                <span>Other: _______</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bottom section */}
                        <div className="border-t pt-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Rent Received By: ____________</span>
                            <span>Signature: ____________</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentElectricityCalculator;