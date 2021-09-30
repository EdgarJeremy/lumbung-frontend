import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  ButtonGroup,

  Navbar,
  Nav,
  NavItem,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  FormInput,
  FormSelect,
  Collapse,
  Modal, ModalBody, ModalHeader,

  FormGroup,
  Form,
  Progress,
  Badge
} from "shards-react";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FileIcon, defaultStyles } from 'react-file-icon';
import axios from 'axios';
import copy from 'clipboard-copy';
import { store } from 'react-notifications-component';
import prettyBytes from 'pretty-bytes';
import isVideo from 'is-video';

export default class Dashboard extends React.Component {
  state = {
    addModal: false,
    files: null,
    q: '',
    uploadProgress: null,
    limit: 10,
    page: 1,
    deleting: null
  }
  async componentDidMount() {
    const { client } = this.props;
    const { q } = this.state;
    client.service('files').on('created', () => {
      this.fetch(q);
    });
    client.service('files').on('removed', () => {
      this.fetch(q);
    });
    await this.fetch(this.state.q);
  }
  async fetch(q) {
    const { client } = this.props;
    const { limit, page } = this.state;
    try {
      const files = await client.service('files').find({
        query: {
          $limit: limit,
          $skip: (page - 1) * limit,
          $sort: {
            createdAt: -1
          },
          name: {
            $iLike: `%${q.trim()}%`
          },
          fileId: null
        },
      });
      this.setState({ files });
      console.log(files);
    } catch (e) { alert(e.message) }
  }
  async onUpload(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    try {
      await axios.post(process.env.REACT_APP_API_URL + '/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': localStorage.getItem('feathers-jwt')
        },
        onUploadProgress: (e) => {
          const progress = (e.loaded / e.total) * 100;
          this.setState({ uploadProgress: progress === 100 ? null : progress });
        },
      });
      this.setState({ addModal: false });
    } catch (e) {
      alert(e.message);
    }
  }
  render() {
    const { client } = this.props;
    const { files, uploadProgress, q, limit, page, deleting } = this.state;
    return (
      <div style={{ maxWidth: 1100, margin: '30px auto' }}>
        <Card>
          <CardHeader>Lumbung Tani Dashboard</CardHeader>
          <CardBody>
            <div style={{ marginBottom: 20 }}>
              <Navbar style={{ padding: 0 }} expand="md">
                <Collapse navbar>
                  <Nav navbar>
                    <NavItem>
                      <Button size="sm" onClick={() => this.setState({ addModal: true })}>Setor</Button>
                    </NavItem>
                  </Nav>
                  <Nav navbar className="ml-auto">
                    <InputGroup size="sm" seamless>
                      <InputGroupAddon type="prepend">
                        <InputGroupText>
                          <FontAwesomeIcon icon={faSearch} />
                        </InputGroupText>
                      </InputGroupAddon>
                      <FormInput placeholder="Cari..." value={q} onChange={(e) => this.setState({ q: e.target.value, page: 1 }, () => this.fetch(this.state.q))} />
                    </InputGroup>
                  </Nav>
                </Collapse>
              </Navbar>
            </div>
            {files ? (
              files.total ?
                (<table className="table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Ukuran</th>
                      <th>Taniers</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.data.map((d, i) => (
                      <tr key={i}>
                        <td>
                          <div>
                            {(() => {
                              const name = d.name.split('.');
                              const ext = name[name.length - 1].toLowerCase();
                              return <FileIcon extension={ext} {...defaultStyles[ext]} />
                            })()} <span style={{ marginLeft: 10 }}>{d.name}</span>
                          </div>
                          {isVideo(d.name) && (<Qualities d={d} />)}
                        </td>
                        <td>{prettyBytes(parseInt(d.size, 10))}</td>
                        <td>{d.user.username}</td>
                        <td style={{ width: '25%' }}>
                          <ButtonGroup size="sm">
                            <Button theme="success" onClick={() => {
                              window.open(process.env.REACT_APP_API_URL + '/download/' + d.id + '?source=internal', '_blank');
                            }}>Ambil</Button>
                            <Button theme="info" onClick={() => {
                              copy(process.env.REACT_APP_API_URL + '/download/' + d.id);
                              store.addNotification({
                                title: 'Link Tersalin',
                                message: 'Link sudah tersalin ke clipboard',
                                type: 'success',
                                insert: 'top',
                                container: 'top-right',
                                animationIn: ["animate__animated", "animate__fadeIn"],
                                animationOut: ["animate__animated", "animate__fadeOut"],
                                dismiss: {
                                  duration: 1000,
                                  onScreen: true
                                }
                              });
                            }}>Salin Link</Button>
                            <Button theme="danger" disabled={d.id === deleting} onClick={() => {
                              this.setState({ deleting: d.id }, async () => {
                                await client.service('files').remove(d.id);
                                this.setState({ deleting: null });
                              });
                            }}>Buang</Button>
                          </ButtonGroup>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <div style={{ marginTop: 20, display: 'inline-block', width: 300 }}>
                      <FormSelect size="sm" style={{ width: '30%' }} value={limit} onChange={(e) => this.setState({ limit: e.target.value, page: 1 }, () => this.fetch(q))}>
                        <option value={10}>10</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </FormSelect>{' '}
                      <ButtonGroup style={{ display: 'inline-block' }} size="sm">
                        <Button disabled={page === 1} onClick={() => this.setState({ page: page - 1 }, () => this.fetch(q))}>{'<'}</Button>
                        <Button disabled={page === Math.ceil(files.total / limit)} onClick={() => this.setState({ page: page + 1 }, () => this.fetch(q))}>{'>'}</Button>
                      </ButtonGroup>
                      <span>{' '}Halaman {page} dari {Math.ceil(files.total / limit)}</span>
                    </div>
                  </tfoot>
                </table>
                ) : <div style={{ textAlign: 'center', marginTop: 20 }}>Lumbung kosong...</div>
            ) : (<p style={{ textAlign: 'center', marginTop: 20 }}>Membuka lumbung...</p>)}
          </CardBody>
          <CardFooter>Copyright &copy; {new Date().getFullYear()} <a href="http://ladangtani.info">ladangtani.info</a></CardFooter>
        </Card>


        <Modal size="md" open={this.state.addModal} toggle={() => this.setState({ addModal: !this.state.addModal })}>
          <ModalHeader>Gerobak Setor</ModalHeader>
          <ModalBody>
            <p>Halo, Taniers! Setor hasil panen kalian ke lumbung dengan mengisi gerobak dibawah ini</p>
            <Form encType="multipart/form-data" onSubmit={this.onUpload.bind(this)}>
              <FormGroup>
                <FormInput placeholder="Nama File" name="name" />
              </FormGroup>
              <FormGroup>
                <FormInput type="file" name="uri" />
              </FormGroup>
              <FormGroup>
                {uploadProgress === null ? <Button theme="success">Setor!</Button> : <Progress value={uploadProgress} animated={true} striped={true}>{Math.round(uploadProgress * 100) / 100}%</Progress>}
              </FormGroup>
            </Form>
          </ModalBody>
        </Modal>
      </div>
    )
  }
}

class Qualities extends React.Component {
  state = {
    collapse: false
  }
  render() {
    const { d } = this.props;
    const { collapse } = this.state;
    return (
      <div style={{ marginLeft: 40 }}>
        <Badge style={{ cursor: 'pointer' }} onClick={() => d.qualities.length > 0 && this.setState({ collapse: !collapse })} pill outline theme={d.qualities.length > 0 ? 'success' : 'warning'}>{d.qualities.length > 0 ? 'Ragam Kualitas Tersedia' : 'Kualitas Dalam Proses'}</Badge>
        <Collapse open={collapse}>
          <table className="table" style={{ marginTop: 5, fontSize: 10, width: '80%' }}>
            {d.qualities.map((q, i) => (
              <tr key={i}>
                <td width="30%">{q.name}</td>
                <td>{prettyBytes(parseInt(q.size, 10))}</td>
                <td>
                  <ButtonGroup size="sm">
                    <Button theme="success" onClick={() => {
                      window.open(process.env.REACT_APP_API_URL + '/download/' + q.id + '?source=internal', '_blank');
                    }}>Ambil</Button>
                    <Button theme="info" onClick={() => {
                      copy(process.env.REACT_APP_API_URL + '/download/' + q.id);
                      store.addNotification({
                        title: 'Link Tersalin',
                        message: 'Link sudah tersalin ke clipboard',
                        type: 'success',
                        insert: 'top',
                        container: 'top-right',
                        animationIn: ["animate__animated", "animate__fadeIn"],
                        animationOut: ["animate__animated", "animate__fadeOut"],
                        dismiss: {
                          duration: 1000,
                          onScreen: true
                        }
                      });
                    }}>Salin Link</Button>
                  </ButtonGroup>
                </td>
              </tr>
            ))}
          </table>
        </Collapse>
      </div>
    )
  }
}