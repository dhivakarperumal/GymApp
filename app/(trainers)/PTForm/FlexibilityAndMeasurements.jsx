import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FlexibilityAndMeasurements = ({
  onNext,
  onPrevious,
  formData: initialFormData,
  isFirstStep,
  isLastStep,
  readOnly = false,
}) => {
  const [localFormData, setLocalFormData] = useState({
    flex_apley_test_l: "",
    flex_apley_test_r: "",
    flex_ymca_val: "",
    flex_ymca_test: "",
    flex_knee_val_l: "",
    flex_knee_val_r: "",
    flex_knee_test_l: "",
    flex_knee_test_r: "",
    measurements: Array(5).fill(null).map(() => ({
      date: "",
      height: "",
      weight: "",
      neck: "",
      shoulder: "",
      arm_l: "",
      arm_r: "",
      chest_normal: "",
      chest_expanded: "",
      waist: "",
      abdomen: "",
      hip: "",
      thigh_l: "",
      thigh_r: "",
      calf_l: "",
      calf_r: "",
      lat: "",
    })),
  });

  useEffect(() => {
    if (initialFormData) {
      setLocalFormData(prev => ({
        ...prev,
        ...initialFormData,
      }));
    }
  }, [initialFormData]);

  const handleChange = (name, value) => {
    if (readOnly) return;
    setLocalFormData(prev => ({ ...prev, [name]: value }));
  };

  const normalizeValue = (value) =>
    String(value || "").trim().toLowerCase();

  const handleMeasurementChange = (index, field, value) => {
    if (readOnly) return;
    const updated = [...localFormData.measurements];
    updated[index] = { ...updated[index], [field]: value };
    setLocalFormData(prev => ({ ...prev, measurements: updated }));
  };

  const handleSubmit = () => {
    onNext(localFormData);
  };

  const Radio = ({ label, name }) => (
    <TouchableOpacity
      onPress={() => handleChange(name, label)}
      className="flex-row items-center gap-3"
    >
      <View
        className={`w-4 h-4 rounded-full border-2 ${
          normalizeValue(localFormData[name]) === label.toLowerCase()
            ? "bg-orange-500 border-orange-500"
            : "border-white/40"
        }`}
      />
      <Text className="text-white text-xs ml-1">{label}</Text>
    </TouchableOpacity>
  );

  const SectionHeader = ({ icon, title }) => (
    <View className="flex-row items-center mb-5 mt-4">
      <Ionicons name={icon} size={20} color="#f97316" />
      <Text className="text-white font-black ml-3 text-lg tracking-tight uppercase">
        {title}
      </Text>
    </View>
  );

  const SideLabel = ({ side }) => (
    <View className="bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20 mb-2 self-start">
      <Text className="text-orange-500 text-[10px] font-black uppercase tracking-widest">{side}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      <View className="py-4 px-1">

        {/* FLEXIBILITY SECTION */}
        <SectionHeader icon="body-outline" title="Flexibility Assessment" />

        {/* Apley's Scratch Test */}
        <View className="bg-[#1a1a1a] p-6 rounded-[32px] mb-8 border border-white/5 shadow-sm">
          <Text className="text-white font-bold mb-5 px-1">Apley's Scratch Test</Text>
          <View className="flex-row gap-10">
            <View className="flex-1">
              <SideLabel side="Left Side" />
              <View className="space-y-4 mt-2">
                <Radio label="Normal" name="flex_apley_test_l" />
                <Radio label="Restricted" name="flex_apley_test_l" />
              </View>
            </View>
            <View className="flex-1">
              <SideLabel side="Right Side" />
              <View className="space-y-4 mt-2">
                <Radio label="Normal" name="flex_apley_test_r" />
                <Radio label="Restricted" name="flex_apley_test_r" />
              </View>
            </View>
          </View>
        </View>

        {/* YMCA Sit & Reach */}
        <View className="bg-[#1a1a1a] p-5 rounded-[32px] mb-6 border border-white/5">
          <Text className="text-white font-bold mb-4">YMCA Sit & Reach</Text>
          <TextInput
            value={localFormData.flex_ymca_val}
            onChangeText={(t) => handleChange("flex_ymca_val", t)}
            placeholder="Score (inches/cm)"
            placeholderTextColor="rgba(255,255,255,0.2)"
            keyboardType="numeric"
            editable={!readOnly}
            className="bg-white/5 p-4 rounded-2xl text-white border border-white/5 mb-4 font-medium"
          />
          <View className="flex-row gap-8 px-1">
            <Radio label="Well" name="flex_ymca_test" />
            <Radio label="Average" name="flex_ymca_test" />
            <Radio label="Poor" name="flex_ymca_test" />
          </View>
        </View>

        {/* Knee Flexion Test */}
        <View className="bg-[#1a1a1a] p-6 rounded-[32px] mb-10 border border-white/5">
          <Text className="text-white font-bold mb-5 px-1">Knee Flexion Test</Text>
          <View className="flex-row gap-8 mb-6">
             <View className="flex-1">
                <SideLabel side="Left Value" />
                <View className="mt-2">
                  <TextInput
                    value={localFormData.flex_knee_val_l}
                    onChangeText={(t) => handleChange("flex_knee_val_l", t)}
                    placeholder="Degrees"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    className="bg-white/5 p-4 rounded-2xl text-white border border-white/5 font-medium"
                  />
                </View>
             </View>
             <View className="flex-1">
                <SideLabel side="Right Value" />
                <View className="mt-2">
                  <TextInput
                    value={localFormData.flex_knee_val_r}
                    onChangeText={(t) => handleChange("flex_knee_val_r", t)}
                    placeholder="Degrees"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    className="bg-white/5 p-4 rounded-2xl text-white border border-white/5 font-medium"
                  />
                </View>
             </View>
          </View>
          <View className="flex-row gap-10">
            <View className="flex-1 px-1">
               <View className="space-y-4">
                 <Radio label="Normal" name="flex_knee_test_l" />
                 <Radio label="Restricted" name="flex_knee_test_l" />
               </View>
            </View>
            <View className="flex-1 px-1">
               <View className="space-y-4">
                 <Radio label="Normal" name="flex_knee_test_r" />
                 <Radio label="Restricted" name="flex_knee_test_r" />
               </View>
            </View>
          </View>
        </View>

        {/* MEASUREMENTS SECTION */}
        <SectionHeader icon="stats-chart-outline" title="Body Measurements" />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
           <View className="bg-[#1a1a1a] rounded-[32px] border border-white/5 overflow-hidden">
             {/* Header Row */}
             <View className="flex-row bg-white/5 border-b border-white/10 p-4">
               <View className="w-24"><Text className="text-orange-500 font-black uppercase text-[10px] tracking-widest">Parameter</Text></View>
               {[1, 2, 3, 4, 5].map((i) => (
                 <View key={i} className="w-20 items-center border-l border-white/5">
                   <Text className="text-white/40 font-black text-[10px]">READING {i}</Text>
                 </View>
               ))}
             </View>

             {/* Dynamic Rows */}
             {[
               { id: 'height', label: 'Height (cm)' },
               { id: 'weight', label: 'Weight (kg)' },
               { id: 'neck', label: 'Neck' },
               { id: 'shoulder', label: 'Shoulder' },
               { id: 'arm', label: 'Arm', split: true },
               { id: 'chest_normal', label: 'Chest (N)' },
               { id: 'chest_expanded', label: 'Chest (E)' },
               { id: 'waist', label: 'Waist' },
               { id: 'abdomen', label: 'Abdomen' },
               { id: 'hip', label: 'Hip' },
               { id: 'thigh', label: 'Thigh', split: true },
               { id: 'calf', label: 'Calf', split: true },
               { id: 'lat', label: 'Lat' },
             ].map((row) => (
               <View key={row.id} className="flex-row border-b border-white/5 items-center py-1">
                 <View className="w-24 p-5">
                   <Text className="text-white text-xs font-bold mb-1">{row.label}</Text>
                   {row.split && <Text className="text-orange-500/60 text-[8px] font-black uppercase mt-1">L / R Side</Text>}
                 </View>
                 {[0, 1, 2, 3, 4].map((i) => (
                   <View key={i} className="w-20 p-3 border-l border-white/5">
                     {row.split ? (
                       <View className="flex-row gap-2">
                         <TextInput
                           value={localFormData.measurements[i][`${row.id}_l`]}
                           onChangeText={(t) => handleMeasurementChange(i, `${row.id}_l`, t)}
                           placeholder="L"
                           placeholderTextColor="rgba(255,255,255,0.1)"
                           className="bg-white/5 flex-1 h-11 rounded-lg text-white text-center text-xs border border-white/5 font-medium"
                         />
                         <TextInput
                           value={localFormData.measurements[i][`${row.id}_r`]}
                           onChangeText={(t) => handleMeasurementChange(i, `${row.id}_r`, t)}
                           placeholder="R"
                           placeholderTextColor="rgba(255,255,255,0.1)"
                           className="bg-white/5 flex-1 h-11 rounded-lg text-white text-center text-xs border border-white/5 font-medium"
                         />
                       </View>
                     ) : (
                       <TextInput
                         value={localFormData.measurements[i][row.id]}
                         onChangeText={(t) => handleMeasurementChange(i, row.id, t)}
                         placeholder="--"
                         placeholderTextColor="rgba(255,255,255,0.1)"
                         className="bg-white/5 h-11 rounded-lg text-white text-center text-xs border border-white/5 font-medium"
                       />
                     )}
                   </View>
                 ))}
               </View>
             ))}
           </View>
        </ScrollView>

        {/* BUTTONS */}
        {!readOnly && (
          <View className="flex-row gap-4 mt-8 px-2">
            <TouchableOpacity
              onPress={onPrevious}
              disabled={isFirstStep}
              className="flex-1 bg-[#262626] p-4 rounded-2xl flex-row items-center justify-center border border-white/10"
              style={{ opacity: isFirstStep ? 0.5 : 1 }}
            >
              <Ionicons name="arrow-back" size={18} color="white" />
              <Text className="text-white font-bold ml-2">Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-2 bg-orange-600 p-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-orange-600/40"
              style={{ flex: 2 }}
            >
              <Text className="text-white font-black uppercase tracking-widest mr-2">
                {isLastStep ? "Complete" : "Next Step"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>
        )}

      </View>
    </View>
  );
};

export default FlexibilityAndMeasurements;