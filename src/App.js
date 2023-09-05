import React from 'react';
import './App.css';
import '@aws-amplify/ui-react/styles.css';

import PropTypes from 'prop-types';
import { faker } from '@faker-js/faker';

import { BrowserRouter as Router, Routes, Route, NavLink, Link, useParams } from 'react-router-dom';
import { Icon, Menu, Dropdown, Divider, Form, Input, Modal, Button, Card, 
  Container, Header, Segment, Placeholder } from 'semantic-ui-react';

import { Amplify, API, graphqlOperation, Analytics } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';

import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';

import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

Analytics.autoTrack('session', {
	enable: true,
	immediate: true
});

Analytics.autoTrack('pageView', {
  enable: true,
  type: 'SPA',
  immediate: true
});

Analytics.autoTrack('event', {
  enable: true,
  immediate: true
});

const CATEGORIES = ['Outdoors', 'Cities'];
const COLORS = ['orange', 'yellow', 'green', 'blue', 'violet', 'purple', 'pink'];

function DealCardImage({dealName, minHeight, fontSize}) {
  function dealColor(name) {
    if (!name) name = '';
    return COLORS[Math.floor(name.length % COLORS.length)];
  }

  return (
    <Segment style={{minHeight, display: 'flex'}} inverted color={dealColor(dealName)} vertical>
      <Header style={{margin: 'auto auto', fontSize}}>{dealName}</Header>
    </Segment>
  );
}

DealCardImage.propTypes = {
  dealName: PropTypes.string,
  minHeight: PropTypes.number,
  fontSize: PropTypes.number
};

function DealCreation() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [name, setName] = React.useState();
  const [category, setCategory] = React.useState();
  
  function handleOpen() {
    handleReset();
    setModalOpen(true);
    Analytics.record({ name: 'createDeal-start', immediate: true });
  }

  function handleReset() {
    setName(faker.address.city());
    setCategory(CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]);
  }

  function handleClose() {
    setModalOpen(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    await API.graphql(graphqlOperation(mutations.createDeal, { input: { name, category }}));
    window.location.reload();
    handleClose();
  }

  const options = CATEGORIES.map(c => ({ key: c, value: c, text: c}));

  return (
    <Modal
      closeIcon
      size='small'
      open={modalOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      trigger={<p><Icon name='plus'/>Create new Deal</p>}>
      <Modal.Header>Create new Deal</Modal.Header>
      <Modal.Content>
        <Form>
            <Form.Field>
              <label>Deal Name</label>
              <Input fluid type='text' placeholder='Set Name' name='name' value={name || ''}
                onChange={(e) => { setName(e.target.value); } }/>
            </Form.Field>
            <Form.Field>
              <label>Category</label>
              <Dropdown fluid placeholder='Select Category' selection options={options} value={category}
                onChange={(e, data) => { setCategory(data.value); } }/>
            </Form.Field>
            {name ? (
              <DealCardImage dealName={name} minHeight={320} fontSize={48}/>
            ) : (
              <Segment style={{minHeight: 320}} secondary/>
            )}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button content='Cancel' onClick={handleClose}/>
        <Button primary labelPosition='right' content='Reset' icon='refresh' onClick={handleReset}/>
        <Button positive labelPosition='right' icon='checkmark' content='Save' href='/'
          disabled = {!(name && category)} 
          onClick={handleSave}
          data-amplify-analytics-on='click'
          data-amplify-analytics-name='createDeal-complete'
          data-amplify-analytics-attrs={`category:${category}`}
        />
      </Modal.Actions>
    </Modal>
  );
}

function DealsListCardGroup({ items, pageViewOrigin, cardStyle }) {
  function dealCards() {
    return items
      .map(deal =>
        <Card
          key={deal.id}
          as={Link} to={{ pathname: `/deals/${deal.id}`, state: { pageViewOrigin } }}
          style={cardStyle}>
          <DealCardImage dealName={deal.name} minHeight={140} fontSize={24}/>
          <Card.Content>
            <Card.Header>{deal.name}</Card.Header>
            <Card.Meta><Icon name='tag'/> {deal.category}</Card.Meta>
          </Card.Content>
        </Card>
      );
  }

  return (
    <Card.Group centered>
      {dealCards()}
    </Card.Group>
  );
}

DealsListCardGroup.propTypes = {
  items: PropTypes.array,
  pageViewOrigin: PropTypes.string,
  cardStyle: PropTypes.object
};

function DealsList() {
  const [deals, setDeals] = React.useState([]);

  React.useEffect(() => {
    async function fetchData () {
      const result = await API.graphql(graphqlOperation(queries.listDeals));
      const deals = result.data.listDeals.items;
      setDeals(deals);
    }
    fetchData();
  }, []);

  document.title = 'Travel Deals';
  return (
    <Container style={{ marginTop: 70 }}>
      <DealsListCardGroup items={deals} pageViewOrigin='Browse'/>
    </Container>
  );
}

function DealDetails() {
  const [deal, setDeal] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  let params = useParams();

  React.useEffect(() => {
    async function loadDealInfo(id) {
      const dealResult = await API.graphql(graphqlOperation(queries.getDeal, { id }));
      const deal = dealResult.data.getDeal;
      setDeal(deal);
      setLoading(false);
      document.title = `${deal.name} - Travel Deals`;
    }
    loadDealInfo(params.dealId);
	Analytics.record({ name: 'viewDeal', attributes: { category: deal.category }, immediate: true });
    return () => {
      setDeal({});
      setLoading(true);
    };
  }, [params.dealId]);
  return (
    <Container>
      <NavLink to='/'><Icon name='arrow left'/>Back to Deals list</NavLink>
      <Divider hidden/>
      <Card key={deal.id} style={{ width: '100%', maxWidth: 720, margin: 'auto' }}>
        {loading ? (
          <Placeholder fluid style={{minHeight: 320}}>
            <Placeholder.Image/>
          </Placeholder>
        ) : (
          <DealCardImage dealName={deal.name} minHeight={320} fontSize={48}/>
        )}
        {loading ? (
          <Placeholder>
            <Placeholder.Line/>
            <Placeholder.Line/>          
          </Placeholder>
        ) : (
          <Card.Content>
            <Card.Header>{deal.name}</Card.Header>
            <Card.Meta><Icon name='tag'/> {deal.category}</Card.Meta>
          </Card.Content>
        )}
      </Card>
      <Divider hidden/>
    </Container>
  );
}

function AuthStateApp() {
  document.title = 'Travel Deals';
  return  (
      <Authenticator>
      {({ signOut, user }) => (
       <div className='App'>
         <Router>
          <Menu fixed='top' color='blue' inverted>
            <Menu.Menu>
              <Menu.Item header href='/'><Icon name='globe'/>Travel Deals</Menu.Item>
            </Menu.Menu>
            <Menu.Menu position='right'>
            <Menu.Item link><DealCreation/></Menu.Item>
              <Dropdown item simple text={user.username}>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={signOut}><Icon name='power off'/>Log Out</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Menu>
          </Menu>
          <Container style={{ marginTop: 70 }}>
          <Routes>
            <Route path="/" element={<DealsList />} />
            <Route path="/deals/:dealId" element={<DealDetails />} />
          </Routes>
          </Container>
       </Router>
     </div>
      )}
    </Authenticator>
  );
}
export default AuthStateApp;
