import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  ChakraProvider,
  Box,
  Button,
  Select,
  Spinner,
  Text,
  Heading,
  HStack,
  useToast,
  Switch,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts';

const chartColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a83279', '#ffbb28', '#d0ed57', '#8dd1e1'];

const AdminAnalyticsDashboard = () => {
  const toast = useToast();
  const { toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('gray.50', 'gray.700');

  const [category, setCategory] = useState('course-stats');
  const [chartType, setChartType] = useState('bar');
  const [title, setTitle] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showDataTable, setShowDataTable] = useState(false);
  const [showDataLabels, setShowDataLabels] = useState(true);
  const [topN, setTopN] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categoryTitleMap = {
    'course-stats': 'Course Statistics',
    'user-activity': 'User Activity',
    'test-performance': 'Test Performance',
    'website-usage': 'Website Usage',
  };

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/analytics/${category}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const raw = Object.entries(res.data.data).map(([key, value]) => ({
        name: key,
        value,
      }));

      const limited = raw.slice(0, topN);
      setData(limited);
      setFilteredData(limited);
      setTitle(categoryTitleMap[category]);
      setCurrentPage(1);
    } catch (err) {
      toast({
        title: 'Failed to fetch analytics.',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [category, topN, toast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = (format) => {
    window.open(`/api/admin/analytics/export/${format}`, '_blank');
  };

  const renderChart = () => {
    const chartProps = {
      data: filteredData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    const commonElements = (
      <>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <CartesianGrid strokeDasharray="3 3" />
      </>
    );

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...chartProps}>
              {commonElements}
              <Bar dataKey="value" fill="#8884d8" label={showDataLabels} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...chartProps}>
              {commonElements}
              <Line type="monotone" dataKey="value" stroke="#82ca9d" label={showDataLabels} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...chartProps}>
              {commonElements}
              <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" label={showDataLabels} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={filteredData} dataKey="value" nameKey="name" outerRadius={140} label={showDataLabels}>
                {filteredData.map((_, index) => (
                  <Cell key={index} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return <Text>No valid chart selected.</Text>;
    }
  };

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Box p={6}>
      <Heading mb={4}>Admin Analytics Dashboard</Heading>

      <HStack spacing={6} wrap="wrap" mb={6}>
        <FormControl>
          <FormLabel>Analytics Category</FormLabel>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.keys(categoryTitleMap).map((key) => (
              <option key={key} value={key}>{categoryTitleMap[key]}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Chart Type</FormLabel>
          <Select value={chartType} onChange={(e) => setChartType(e.target.value)}>
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="pie">Pie</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Top N Records</FormLabel>
          <Slider defaultValue={10} min={1} max={20} step={1} onChange={(val) => setTopN(val)} width="150px">
            <SliderTrack><SliderFilledTrack /></SliderTrack>
            <SliderThumb />
          </Slider>
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Show Data Labels</FormLabel>
          <Switch isChecked={showDataLabels} onChange={() => setShowDataLabels(!showDataLabels)} />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Dark Mode</FormLabel>
          <Switch onChange={toggleColorMode} />
        </FormControl>

        <FormControl>
          <FormLabel>Search</FormLabel>
          <Input placeholder="Type name..." onChange={(e) => {
            const keyword = e.target.value.toLowerCase();
            const filtered = data.filter((item) => item.name.toLowerCase().includes(keyword));
            setFilteredData(filtered);
            setCurrentPage(1);
          }} />
        </FormControl>

        <FormControl>
          <FormLabel>Download Report</FormLabel>
          <HStack>
            <Button onClick={() => handleExport('csv')} colorScheme="blue">CSV</Button>
            <Button onClick={() => handleExport('pdf')} colorScheme="red">PDF</Button>
          </HStack>
        </FormControl>

        <Button colorScheme="teal" onClick={fetchAnalytics}>Refresh</Button>

        <Button onClick={() => {
          setCategory('course-stats');
          setChartType('bar');
          setTopN(10);
          setShowDataLabels(true);
          setShowDataTable(false);
          setCurrentPage(1);
        }}>
          Reset Filters
        </Button>

        <Button onClick={() => setShowDataTable(!showDataTable)} variant="outline">
          {showDataTable ? 'Hide' : 'Show'} Data Table
        </Button>
      </HStack>

      {loading ? (
        <Spinner size="xl" />
      ) : (
        <Box bg={bgColor} p={6} rounded="md" shadow="md">
          <Text fontSize="xl" fontWeight="bold" mb={4}>{title}</Text>
          {renderChart()}

          {showDataTable && (
            <Box mt={6}>
              <Heading size="md" mb={2}>Raw Data Table</Heading>
              <Table variant="simple">
                <Thead>
                  <Tr><Th>Name</Th><Th>Value</Th></Tr>
                </Thead>
                <Tbody>
                  {paginatedData.map((item, idx) => (
                    <Tr key={idx}><Td>{item.name}</Td><Td>{item.value}</Td></Tr>
                  ))}
                </Tbody>
              </Table>
              <HStack mt={4} justify="center">
                <Button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} isDisabled={currentPage === 1}>Previous</Button>
                <Text>Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}</Text>
                <Button
                  onClick={() => setCurrentPage(p => p < Math.ceil(filteredData.length / itemsPerPage) ? p + 1 : p)}
                  isDisabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
                >Next</Button>
              </HStack>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AdminAnalyticsDashboard;
