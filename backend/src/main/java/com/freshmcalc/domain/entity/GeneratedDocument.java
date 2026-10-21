package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Generated PDF quotation / report metadata.
 */
@Entity
@Table(name = "generated_documents")
public class GeneratedDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "calculation_id", nullable = false)
    private Long calculationId;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType; // QUOTATION

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "download_url", length = 500)
    private String downloadUrl;

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Long getCalculationId() { return calculationId; }
    public void setCalculationId(Long calculationId) { this.calculationId = calculationId; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
}
